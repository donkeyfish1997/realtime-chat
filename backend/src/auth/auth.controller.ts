import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from '../common/decorator/public.decorator';
import { ZodValidationPipe as ZodPipe } from 'src/common/pipe/zodValidation.pipe';
import {
  checkTokenValidSchema,
  confirmChangeEmailSchema,
  registerSchema,
  requestChangeEmailSchema,
  requestPasswordResetSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './dto/authController.dto';
import type {
  CheckTokenValidDto,
  ConfirmChangeEmailDto,
  RegisterDto,
  RequestChangeEmailDto,
  RequestPasswordResetDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/authController.dto';
import { User } from '@prisma/client';
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    access_token: string;
  }> {
    return this.authService.login(
      req.user as NonNullable<Request['user']>,
      res,
    );
  }
  @Public(false)
  @Post('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = req.user as NonNullable<Request['user']>;
    return this.authService.logout(user, res);
  }

  @Post('get-access-token')
  getAccessToken(@Req() req: Request): Promise<{ access_token: string }> {
    return this.authService.getAccessToken(req);
  }
  @Post('register')
  @UsePipes(new ZodPipe(registerSchema))
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }
  @Get('verify-email')
  @UsePipes(new ZodPipe(verifyEmailSchema))
  verifyEmail(@Query() query: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(query);
  }

  @Post('resend-verification-email')
  @UsePipes(new ZodPipe(resendVerificationEmailSchema))
  resendVerificationEmail(
    @Body() body: ResendVerificationEmailDto,
  ): Promise<void> {
    return this.authService.resendVerificationEmail(body.email);
  }
  @Public(false)
  @Post('request-change-email')
  @UsePipes(new ZodPipe(requestChangeEmailSchema))
  requestChangeEmail(
    @Body() body: RequestChangeEmailDto,
    @Req() request: Request,
  ): Promise<void> {
    const userId = request.user?.id as string;
    return this.authService.requestChangeEmail(userId, body.newEmail);
  }
  @Get('confirm-change-email')
  @UsePipes(new ZodPipe(confirmChangeEmailSchema))
  confirmChangeEmail(@Query() query: ConfirmChangeEmailDto): Promise<void> {
    return this.authService.confirmChangeEmail(query);
  }

  @Post('request-password-reset')
  @UsePipes(new ZodPipe(requestPasswordResetSchema))
  requestPasswordReset(@Body() body: RequestPasswordResetDto): Promise<void> {
    return this.authService.requestPasswordReset(body.email);
  }
  @Post('reset-password')
  @UsePipes(new ZodPipe(resetPasswordSchema))
  resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(body);
  }

  @Post('check-token-valid')
  @UsePipes(new ZodPipe(checkTokenValidSchema))
  checkTokenValid(@Body() body: CheckTokenValidDto): Promise<void> {
    return this.authService.checkTokenValid(body);
  }
}
