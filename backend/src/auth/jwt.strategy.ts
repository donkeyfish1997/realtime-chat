import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET; //defined in doker-compose
if (!JWT_SECRET) throw new Error('can not find env.JWT_SECRET');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET as string,
    });
  }

  validate(
    payload: NonNullable<Request['user']>,
  ): NonNullable<Request['user']> {
    return payload;
  }
}
