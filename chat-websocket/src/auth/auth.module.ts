import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

const JWT_SECRET = process.env.JWT_SECRET; //defined in doker-compose
if (!JWT_SECRET) throw new Error('can not find env.JWT_SECRET');
@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '2 days' },
    }),
  ],

  exports: [JwtModule],
})
export class AuthModule {}
