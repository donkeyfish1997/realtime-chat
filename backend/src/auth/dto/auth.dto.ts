import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { userSchema } from 'src/user/dto/user.dto';

const email = z.email();
const newEmail = email;
const password = z.string().min(8).trim().nonempty();
const newPassword = password;
const identifier = z.email();
const token = z.string();
const type = z.enum(['email_verify', 'password_reset', 'change_email']);

const loginSchema = z.object({ email, password });
export class LoginDto extends createZodDto(loginSchema) {}

const loginResponseSchema = z.object({
  access_token: z.string(),
  user: userSchema,
});
export class LoginResponseDto extends createZodDto(loginResponseSchema) {}

const registerSchema = z.object({ name: z.string(), email, password });
export class RegisterDto extends createZodDto(registerSchema) {}

const verifyEmailSchema = z.object({ token, identifier });
export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}

const requestPasswordResetSchema = z.object({ email });
export class RequestPasswordResetDto extends createZodDto(
  requestPasswordResetSchema,
) {}

const resendVerificationEmailSchema = z.object({ email });
export class ResendVerificationEmailDto extends createZodDto(
  resendVerificationEmailSchema,
) {}

const resetPasswordSchema = z.object({ token, identifier, newPassword });
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}

const requestChangeEmailSchema = z.object({
  newEmail,
});
export class RequestChangeEmailDto extends createZodDto(
  requestChangeEmailSchema,
) {}

const confirmChangeEmailSchema = z.object({ newEmail, token });
export class ConfirmChangeEmailDto extends createZodDto(
  confirmChangeEmailSchema,
) {}

const checkTokenValidSchema = z.object({ token, identifier, type });
export class CheckTokenValidDto extends createZodDto(checkTokenValidSchema) {}

const getAccessTokenResponseSchema = z.object({ access_token: z.string() });
export class GetAccessTokenResponseDto extends createZodDto(
  getAccessTokenResponseSchema,
) {}
