import { z } from 'zod';
const email = z.email();
const newEmail = email;
const password = z.string();
const newPassword = password;
const identifier = z.email();
const token = z.string();
const type = z.enum(['EMAIL_VERIFY', 'PASSWORD_RESET', 'CHANGE_EMAIL']);

export const registerSchema = z.object({ email, password });
export type RegisterDto = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({ token, identifier });
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export const requestPasswordResetSchema = z.object({ email });
export type requestPasswordResetDto = z.infer<
  typeof requestPasswordResetSchema
>;

export const resendVerificationEmailSchema = z.object({ email });
export type ResendVerificationEmailDto = z.infer<
  typeof resendVerificationEmailSchema
>;

export type RequestPasswordResetDto = z.infer<
  typeof requestPasswordResetSchema
>;

export const resetPasswordSchema = z.object({ token, identifier, newPassword });
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const requestChangeEmailSchema = z.object({
  // userId: z.cuid().optional(), // 如果從 JWT 取得則可選
  newEmail,
});
export type RequestChangeEmailDto = z.infer<typeof requestChangeEmailSchema>;

export const confirmChangeEmailSchema = z.object({ newEmail, token });
export type ConfirmChangeEmailDto = z.infer<typeof confirmChangeEmailSchema>;

export const checkTokenValidSchema = z.object({ token, identifier, type });
export type CheckTokenValidDto = z.infer<typeof checkTokenValidSchema>;
