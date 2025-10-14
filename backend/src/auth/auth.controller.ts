import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from '../common/decorator/public.decorator';
import {
  CheckTokenValidDto,
  ConfirmChangeEmailDto,
  RegisterDto,
  RequestChangeEmailDto,
  RequestPasswordResetDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
  LoginResponseDto,
  LoginDto,
} from './dto/auth.dto';
import { User } from '@prisma/client';
import { ZodResponse } from 'nestjs-zod';
import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { REFRESH_TOKEN_EXPIRY_SEC } from './refresh-token/refresh-token.service';

const REFRESH_TOKEN = 'refresh_token';
@ApiBearerAuth()
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ZodResponse({ type: LoginResponseDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { access_token, user, refreshToken } = await this.authService.login(
      req.user as NonNullable<Request['user']>,
    );
    this.setRefreshTokentoCookie(res, refreshToken);
    const emailVerified = user.emailVerified?.toISOString() ?? null;
    return { access_token, user: { ...user, emailVerified } };
  }
  // -------- //
  @Public(false)
  @Post('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.clearRefreshTokentoCookie(res);
    const user = req.user as NonNullable<Request['user']>;
    return this.authService.logout(user);
  }
  // -------- //
  @ZodResponse({ type: LoginResponseDto })
  @Post('get-access-token')
  async getAccessToken(@Req() req: Request): Promise<LoginResponseDto> {
    const refreshToken = this.getRefreshTokenFromCookie(req);
    const { access_token, user } = await this.authService.getAccessToken({
      refreshToken,
    });
    const emailVerified = user.emailVerified?.toISOString() ?? null;
    return { access_token, user: { ...user, emailVerified } };
  }

  // -------- //
  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }
  // -------- //
  @Get('verify-email')
  verifyEmail(@Query() query: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(query);
  }
  // -------- //
  @Post('resend-verification-email')
  resendVerificationEmail(
    @Body() body: ResendVerificationEmailDto,
  ): Promise<void> {
    return this.authService.resendVerificationEmail(body.email);
  }
  // -------- //
  @Public(false)
  @Post('request-change-email')
  requestChangeEmail(
    @Body() body: RequestChangeEmailDto,
    @Req() request: Request,
  ): Promise<void> {
    const userId = request.user?.id as string;
    return this.authService.requestChangeEmail(userId, body.newEmail);
  }
  // -------- //
  @Get('confirm-change-email')
  confirmChangeEmail(@Query() query: ConfirmChangeEmailDto): Promise<void> {
    return this.authService.confirmChangeEmail(query);
  }
  // -------- //
  @Post('request-password-reset')
  requestPasswordReset(@Body() body: RequestPasswordResetDto): Promise<void> {
    return this.authService.requestPasswordReset(body.email);
  }
  // -------- //
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(body);
  }
  // -------- //
  @Post('check-token-valid')
  checkTokenValid(@Body() body: CheckTokenValidDto): Promise<void> {
    return this.authService.checkTokenValid(body);
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
      maxAge: REFRESH_TOKEN_EXPIRY_SEC * 1000,
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
