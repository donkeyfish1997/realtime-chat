import {
  Controller,
  Post,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Request() req: ExpressRequest) {
    if (req.user) {
      return this.authService.login(req.user as any);
    }

    throw new UnauthorizedException();
  }
  // @UseGuards(LocalAuthGuard)
  // @Get('logout')
  // logout(@Request() req: ExpressRequest) {
  // return req.logout();
  // }

  //test
  @Get('test')
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}
