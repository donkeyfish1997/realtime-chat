import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request as ExpressRequest } from 'express';
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
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: ExpressRequest) {
    return this.authService.login(
      req.user as NonNullable<ExpressRequest['user']>,
    );
  }
  @Post('register')
  @UsePipes(new ZodPipe(registerSchema))
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
  @Get('verify-email')
  @UsePipes(new ZodPipe(verifyEmailSchema))
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.authService.verifyEmail(query);
  }

  @Post('resend-verification-email')
  @UsePipes(new ZodPipe(resendVerificationEmailSchema))
  resendVerificationEmail(@Body() body: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(body.email);
  }
  @Public(false)
  @Post('request-change-email')
  @UsePipes(new ZodPipe(requestChangeEmailSchema))
  requestChangeEmail(
    @Body() body: RequestChangeEmailDto,
    @Request() request: ExpressRequest,
  ) {
    const userId = request.user?.id as string;
    return this.authService.requestChangeEmail(userId, body.newEmail);
  }
  @Get('confirm-change-email')
  @UsePipes(new ZodPipe(confirmChangeEmailSchema))
  confirmChangeEmail(@Query() query: ConfirmChangeEmailDto) {
    return this.authService.confirmChangeEmail(query);
  }

  @Post('request-password-reset')
  @UsePipes(new ZodPipe(requestPasswordResetSchema))
  requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body.email);
  }
  @Post('reset-password')
  @UsePipes(new ZodPipe(resetPasswordSchema))
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('check-token-valid')
  @UsePipes(new ZodPipe(checkTokenValidSchema))
  checkTokenValid(@Body() body: CheckTokenValidDto) {
    return this.authService.checkTokenValid(body);
  }
}
