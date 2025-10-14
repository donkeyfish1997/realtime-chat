import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { createTokenAndHash, getTokenHash } from '../utilities/tokenAndHash';
import { RedisService } from 'src/redis/redis.service';

export const REFRESH_TOKEN_EXPIRY_SEC = 14 * 24 * 60 * 60; // 14 天

@Injectable()
export class RefreshTokenService {
  constructor(private redis: RedisService) {}
  async validate({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<{ userId: string }> {
    const tokenHash = getTokenHash(refreshToken);
    const userId = await this.redis.get('refresh:tokenHash', tokenHash);
    if (!userId) throw new UnauthorizedException("refresh_token didn't set");
    const latestTokenHash = await this.redis.get(
      'active.refresh.tokenHash:userId',
      userId,
    );
    if (latestTokenHash !== tokenHash)
      throw new UnauthorizedException('refresh_token is expired');
    return { userId };
  }
  async create(userId: string): Promise<{ refreshToken: string }> {
    await this.clear(userId);
    const { token, tokenHash } = createTokenAndHash();
    await Promise.all([
      this.redis.set(
        'active.refresh.tokenHash:userId',
        userId,
        tokenHash,
        REFRESH_TOKEN_EXPIRY_SEC,
      ),
      this.redis.set(
        'refresh:tokenHash',
        tokenHash,
        userId,
        REFRESH_TOKEN_EXPIRY_SEC,
      ),
    ]);
    return { refreshToken: token };
  }
  async clear(userId: string): Promise<void> {
    const tokenHash = await this.redis.get(
      'active.refresh.tokenHash:userId',
      userId,
    );
    await Promise.all([
      this.redis.del('active.refresh.tokenHash:userId', userId),
      tokenHash && this.redis.del('refresh:tokenHash', tokenHash),
    ]);
  }
}
