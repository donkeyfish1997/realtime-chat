import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
const JWT_SECRET = process.env.JWT_SECRET; //defined in doker-compose
if (!JWT_SECRET) throw new Error('can not find env.JWT_SECRET');
@Module({
  imports: [
    UserModule,
    RefreshTokenModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '2 days' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
