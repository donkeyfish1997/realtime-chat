import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [PrismaService, UserService],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
