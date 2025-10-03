import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from '../common/decorator/public.decorator';
import {
  CheckTokenValidDto,
  ConfirmChangeEmailDto,
  GetAccessTokenResponseDto,
  RegisterDto,
  RequestChangeEmailDto,
  RequestPasswordResetDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
  LoginResponseDto,
  LoginDto,
} from './dto/authController.dto';
import { User } from '@prisma/client';
import { ZodResponse } from 'nestjs-zod';
import { ApiBody, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('refresh-cookie-scheme')
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
    const { access_token, user } = await this.authService.login(
      req.user as NonNullable<Request['user']>,
      res,
    );
    const emailVerified = user.emailVerified?.toDateString();
    return { access_token, user: { ...user, emailVerified } };
  }
  // -------- //
  @Public(false)
  @Post('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = req.user as NonNullable<Request['user']>;
    return this.authService.logout(user, res);
  }
  // -------- //
  @ZodResponse({ type: GetAccessTokenResponseDto })
  @Post('get-access-token')
  getAccessToken(@Req() req: Request): Promise<{ access_token: string }> {
    return this.authService.getAccessToken(req);
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
}
