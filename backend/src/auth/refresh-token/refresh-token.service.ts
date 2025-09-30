import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Session } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { createToken } from '../utilities/tokenAndHash';

const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_EXPIRY = 14 * 24 * 60 * 60 * 1000; // 14 天 (毫秒)

@Injectable()
export class RefreshTokenService {
  constructor(private prismaService: PrismaService) {}
  async validate(request: Request): Promise<Session> {
    const refreshToken = this.getRefreshTokenFromCookie(request);
    const session = await this.prismaService.session.findFirst({
      where: { sessionToken: refreshToken, expires: { gt: new Date() } },
    });
    if (!session) {
      throw new UnauthorizedException("refresh_token is expired or didn't set");
    }
    return session;
  }
  async create(userId: string, response: Response) {
    await this.clear(userId, response);
    const token = createToken();
    await this.prismaService.session.create({
      data: {
        sessionToken: token,
        expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        userId,
      },
    });
    this.setRefreshTokentoCookie(response, token);
  }
  async clear(userId: string, response: Response) {
    await this.prismaService.session.updateMany({
      data: {
        expires: new Date(),
      },
      where: { userId: userId, expires: { gt: new Date() } },
    });
    this.clearRefreshTokentoCookie(response);
  }
  private getRefreshTokenFromCookie(request: Request): string {
    const refreshToken = request.cookies[REFRESH_TOKEN] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException("cookie 'refresh_token' didn't set");
    }
    return refreshToken;
  }
  private setRefreshTokentoCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true, // 核心！防止 XSS 攻擊
      secure: process.env.NODE_ENV === 'production', // 僅在 HTTPS 環境下發送 (正式環境必開)
      sameSite: 'lax', // 防止 CSRF 的常見設定
      maxAge: REFRESH_TOKEN_EXPIRY,
    });
  }
  private clearRefreshTokentoCookie(response: Response): void {
    response.clearCookie(REFRESH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}
