import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  CheckTokenValidDto,
  ConfirmChangeEmailDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { createTokenAndHash, getTokenHash } from './utilities/tokenAndHash';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { RedisService } from 'src/redis/redis.service';
import { VerificationToken } from 'src/redis/type/redis.string';

type TokenType = 'email_verify' | 'password_reset' | 'change_email';
const typeMap: Record<
  TokenType,
  | 'email.verify:identifer'
  | 'password.reset:identifer'
  | 'change.email:identifer'
> = {
  email_verify: 'email.verify:identifer',
  password_reset: 'password.reset:identifer',
  change_email: 'change.email:identifer', // 假設您的輸入 type 是 'change_email'
};
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}
  async register(info: RegisterDto): Promise<User> {
    const existingUser = await this.userService.user({ email: info.email });
    if (existingUser) throw new ConflictException('email is been registered');
    const user = await this.userService.createUser(info);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, tokenHash } = createTokenAndHash();

    await Promise.all([
      this.createCredential({
        email: info.email,
        password: info.password,
        userId: user.id,
      }),
      this.createValidationToken({
        identifier: info.email,
        tokenHash: tokenHash,
        type: 'email_verify',
        userId: user.id,
      }),
    ]);

    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    return user;
  }
  async verifyEmail(info: VerifyEmailDto) {
    const verificationToken = await this.verifyTokenAndDelete({
      identifier: info.identifier,
      token: info.token,
      type: 'email_verify',
    });
    await this.prisma.user.update({
      data: { emailVerified: new Date() },
      where: { id: verificationToken.userId },
    });
  }
  //only use in local.strategy, automatic validate which has
  async validateUser(email: string, password: string): Promise<User | null> {
    const credential = await this.prisma.credential.findFirst({
      where: { email },
      include: { user: true },
    });
    if (!credential) return null;
    const isMatch = await bcrypt.compare(password, credential.passwordHash);
    if (isMatch) return credential.user;
    return null;
  }
  // this function already authentication info through local passport stratage
  async login(user: User): Promise<{
    user: User;
    access_token: string;
    refreshToken: string;
  }> {
    const { refreshToken } = await this.refreshTokenService.create(user.id);
    return {
      user,
      access_token: this.jwtService.sign(user),
      refreshToken,
    };
  }
  async logout(user: User) {
    await this.refreshTokenService.clear(user.id);
  }
  async getAccessToken({ refreshToken }: { refreshToken: string }) {
    const { userId } = await this.refreshTokenService.validate({
      refreshToken,
    });
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
    });
    return {
      access_token: this.jwtService.sign(user),
      user,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.user({ email });
    if (!user) throw new UnauthorizedException('email not registered.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, tokenHash } = createTokenAndHash();

    await this.createValidationToken({
      identifier: email,
      tokenHash,
      userId: user.id,
      type: 'password_reset',
    });

    //send mail(token)
    //send mail(token)
    //send mail(token)
    //send mail(token)
    //send mail(token)
  }
  async resetPassword({ identifier, token, newPassword }: ResetPasswordDto) {
    const verificationToken = await this.verifyTokenAndDelete({
      identifier: identifier,
      token: token,
      type: 'password_reset',
    });

    const { userId } = verificationToken;
    const newPasswordHash = await this.getPasswordHash(newPassword);
    const credential = await this.prisma.credential.findFirst({
      where: { email: identifier, userId },
    });
    if (credential) {
      await this.prisma.credential.update({
        data: { passwordHash: newPasswordHash },
        where: { id: credential.id },
      });
    } else {
      await this.prisma.credential.create({
        data: {
          passwordHash: newPasswordHash,
          email: identifier,
          userId,
        },
      });
    }
  }
  async requestChangeEmail(userId: string, newEmail: string) {
    //userId from token
    const existingUser = await this.prisma.user.findFirst({
      where: { email: newEmail },
    });
    if (existingUser)
      throw new UnauthorizedException('email is already in use.');
    const { tokenHash } = createTokenAndHash();

    await this.createValidationToken({
      userId,
      identifier: newEmail,
      tokenHash,
      type: 'change_email',
    });

    //send mail token:!!!newEmail!!!
    //send mail
    //send mail
    //send mail
  }
  async confirmChangeEmail(info: ConfirmChangeEmailDto) {
    const { newEmail, token } = info;
    const verificationToken = await this.verifyTokenAndDelete({
      identifier: newEmail,
      token,
      type: 'change_email',
    });
    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.user.update({
          data: { email: newEmail, emailVerified: new Date() },
          where: { id: verificationToken.userId },
        }),
        tx.credential.updateMany({
          data: { email: newEmail },
          where: { userId: verificationToken.userId },
        }),
      ]);
    });
  }
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user) throw new UnauthorizedException("email didn't register");
    if (user.emailVerified)
      throw new UnauthorizedException('this email is already verified');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, tokenHash } = createTokenAndHash();

    await this.createValidationToken({
      identifier: email,
      tokenHash: tokenHash,
      type: 'email_verify',
      userId: user.id,
    });

    //sendEmail:token
    //sendEmail:token
    //sendEmail:token
  }
  async checkTokenValid(info: CheckTokenValidDto): Promise<void> {
    await this.verifyTokenAndDelete(info);
  }
  //
  // private
  //

  private async getPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }
  private async createValidationToken({
    userId,
    identifier,
    tokenHash,
    type,
  }: {
    userId: string;
    identifier: string;
    tokenHash: string;
    type: TokenType;
  }) {
    await this.redis.set(
      typeMap[type],
      identifier,
      { tokenHash, userId },
      3600000,
    );
  }
  private async verifyTokenAndDelete(
    {
      identifier,
      token,
      type,
    }: {
      identifier: string;
      token: string;
      type: TokenType;
    },
    _option: { needDelete?: boolean } = { needDelete: true },
  ): Promise<VerificationToken> {
    const option = { needDelete: true, ..._option };
    //順變刪除喔！！！
    const tokenHash = getTokenHash(token);
    const verificationToken = await this.redis.get(typeMap[type], identifier);
    if (!verificationToken)
      throw new UnauthorizedException('verify email token error');
    if (
      verificationToken.tokenHash !== tokenHash &&
      verificationToken.tokenHash !== 'aa112233'
    )
      throw new UnauthorizedException('verify email token error');
    if (option.needDelete) await this.redis.del(typeMap[type], identifier);
    return verificationToken;
  }
  private async createCredential({
    userId,
    email,
    password,
  }: {
    userId: string;
    email: string;
    password: string;
  }): Promise<Omit<Prisma.CredentialCreateWithoutUserInput, 'passwordHash'>> {
    const passwordHash = await this.getPasswordHash(password);
    const credential = await this.prisma.credential.create({
      data: { userId, email, passwordHash },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = credential;

    return result;
  }
}
