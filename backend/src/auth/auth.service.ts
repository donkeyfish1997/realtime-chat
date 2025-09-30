import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
// import crypto from 'crypto';
import {
  Prisma,
  PrismaClient,
  VerificationTokenType,
  User,
} from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  CheckTokenValidDto,
  ConfirmChangeEmailDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/authController.dto';
import { createTOkenAndHash, getTokenHash } from './utilities/tokenAndHash';
import { Request, Response } from 'express';
import { RefreshTokenService } from './refresh-token/refresh-token.service';

type TokenType =
  (typeof VerificationTokenType)[keyof typeof VerificationTokenType];
export type JWTpayload = Omit<User, 'id'> & { sub: string };
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
  ) {}
  async register(info: RegisterDto): Promise<User> {
    const existingUser = await this.userService.user({ email: info.email });
    if (existingUser) throw new ConflictException('email is been registered');
    const user = await this.userService.createUser(info);
    const passwordHash = await this.getPasswordHash(info.password);
    const { token, tokenHash } = createTOkenAndHash();
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all([
        this.createCredential(
          {
            email: info.email,
            passwordHash,
            userId: user.id,
          },
          tx,
        ),
        this.createValidationTokenAndExpireOlds(
          {
            identifier: info.email,
            tokenHash: tokenHash,
            type: 'EMAIL_VERIFY',
            userId: user.id,
          },
          tx,
        ),
      ]);
    });
    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    //sendEmail('token')....
    return user;
  }
  async verifyEmail(info: VerifyEmailDto) {
    const tokenHash = getTokenHash(info.token);
    const verificationToken = await this.getAndCheckVerifiedVerificationToken(
      {
        identifier: info.identifier,
        tokenHash,
        type: 'EMAIL_VERIFY',
      },
      this.prismaService,
    );
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all([
        tx.user.update({
          data: { emailVerified: new Date() },
          where: { id: verificationToken.user.id },
        }),
        this.setValidationTokensExpire(
          verificationToken.userId,
          'EMAIL_VERIFY',
          tx,
        ),
      ]);
    });
  }
  //only use in local.strategy, automatic validate which has
  async validateUser(email: string, password: string): Promise<User | null> {
    const credential = await this.prismaService.credential.findFirst({
      where: { email },
      include: { user: true },
    });
    if (!credential) return null;
    const isMatch = await bcrypt.compare(password, credential.passwordHash);
    if (isMatch) return credential.user;
    return null;
  }
  // this function already authentication info through local passport stratage
  async login(user: User, res: Response): Promise<{ access_token: string }> {
    await this.refreshTokenService.create(user.id, res);
    return {
      access_token: this.jwtService.sign(user),
    };
  }
  async logout(user: User, res: Response) {
    await this.refreshTokenService.create(user.id, res);
  }
  async getAccessToken(req: Request) {
    const session = await this.refreshTokenService.validate(req);
    const user = await this.prismaService.user.findFirstOrThrow({
      where: { id: session.userId },
    });
    return {
      access_token: this.jwtService.sign(user),
    };
  }
  async requestPasswordReset(email: string) {
    const user = await this.userService.user({ email });
    if (!user) throw new UnauthorizedException('email not registered.');
    const { token, tokenHash } = createTOkenAndHash();
    await this.prismaService.$transaction(async (tx) => {
      await this.createValidationTokenAndExpireOlds(
        {
          identifier: email,
          tokenHash,
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
        tx,
      );
    });

    //send mail(token)
    //send mail(token)
    //send mail(token)
    //send mail(token)
    //send mail(token)
  }
  async resetPassword(info: ResetPasswordDto) {
    const tokenHash = getTokenHash(info.token);
    const verificationToken = await this.getAndCheckVerifiedVerificationToken(
      {
        identifier: info.identifier,
        tokenHash,
        type: 'PASSWORD_RESET',
      },
      this.prismaService,
    );

    const user = verificationToken.user;
    const newPasswordHash = await this.getPasswordHash(info.newPassword);
    const credential = await this.prismaService.credential.findFirst({
      where: { email: user.email, userId: user.id },
    });
    if (credential) {
      await this.prismaService.credential.update({
        data: { passwordHash: newPasswordHash },
        where: { id: credential.id },
      });
    } else {
      await this.prismaService.credential.create({
        data: {
          passwordHash: newPasswordHash,
          email: user.email,
          userId: user.id,
        },
      });
    }
    await this.setValidationTokensExpire(
      user.id,
      'PASSWORD_RESET',
      this.prismaService,
    );
  }
  async requestChangeEmail(userId: string, newEmail: string) {
    //userId from token
    const existingUser = await this.prismaService.user.findFirst({
      where: { email: newEmail },
    });
    if (existingUser)
      throw new UnauthorizedException('email is already in use.');
    const { token, tokenHash } = createTOkenAndHash();
    await this.prismaService.$transaction(async (tx) => {
      await this.createValidationTokenAndExpireOlds(
        {
          userId,
          identifier: newEmail,
          tokenHash,
          type: 'CHANGE_EMAIL',
        },
        tx,
      );
    });
    //send mail token:!!!newEmail!!!
    //send mail
    //send mail
    //send mail
  }
  async confirmChangeEmail(info: ConfirmChangeEmailDto) {
    const { newEmail, token } = info;
    const tokenHash = getTokenHash(token);
    const verificationToken = await this.getAndCheckVerifiedVerificationToken(
      {
        identifier: newEmail,
        tokenHash,
        type: 'CHANGE_EMAIL',
      },
      this.prismaService,
    );
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all([
        tx.user.update({
          data: { email: newEmail, emailVerified: new Date() },
          where: { id: verificationToken.userId },
        }),
        tx.credential.updateMany({
          data: { email: newEmail },
          where: { userId: verificationToken.userId },
        }),
        this.setValidationTokensExpire(
          verificationToken.userId,
          'CHANGE_EMAIL',
          tx,
        ),
      ]);
    });
  }
  async resendVerificationEmail(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (!user) throw new UnauthorizedException("email didn't register");
    if (user.emailVerified)
      throw new UnauthorizedException('this email is already verified');
    const { token, tokenHash } = createTOkenAndHash();
    await this.prismaService.$transaction(async (tx) => {
      await this.createValidationTokenAndExpireOlds(
        {
          identifier: email,
          tokenHash: tokenHash,
          type: 'EMAIL_VERIFY',
          userId: user.id,
        },
        tx,
      );
    });
    //sendEmail:token
  }
  async checkTokenValid(info: CheckTokenValidDto): Promise<void> {
    const tokenHash = getTokenHash(info.token);
    await this.getAndCheckVerifiedVerificationToken(
      { ...info, tokenHash },
      this.prismaService,
    );
  }
  //
  // private
  //

  private async getPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }

  private async createValidationTokenAndExpireOlds(
    info: {
      userId: string;
      identifier: string;
      tokenHash: string;
      type: TokenType;
    },
    tx: Prisma.TransactionClient | PrismaClient,
  ) {
    if (tx instanceof PrismaClient) {
      await tx.$transaction(async (tx) => {
        await this.setValidationTokensExpire(info.userId, info.type, tx);
        await this.createValidationToken(info, tx);
      });
    } else {
      await this.setValidationTokensExpire(info.userId, info.type, tx);
      await this.createValidationToken(info, tx);
    }
  }
  private createValidationToken(
    info: {
      userId: string;
      identifier: string;
      tokenHash: string;
      type: TokenType;
    },
    tx: Prisma.TransactionClient,
  ) {
    const expires = new Date(Date.now() + 3600000);
    return tx.verificationToken.create({
      data: {
        userId: info.userId,
        identifier: info.identifier,
        tokenHash: info.tokenHash,
        type: info.type,
        expires: expires,
      },
    });
  }
  private setValidationTokensExpire(
    userId: string,
    tokenType: TokenType,
    tx: Prisma.TransactionClient,
  ): Prisma.PrismaPromise<any> {
    return tx.verificationToken.updateMany({
      data: { expires: new Date() },
      where: {
        userId,
        type: tokenType,
        expires: { gt: new Date() },
      },
    });
  }
  private async createCredential(
    info: { userId: string; email: string; passwordHash: string },
    tx: Prisma.TransactionClient,
  ): Promise<Omit<Prisma.CredentialCreateWithoutUserInput, 'passwordHash'>> {
    const credential = await tx.credential.create({ data: info });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = credential;

    return result;
  }
  private async getAndCheckVerifiedVerificationToken(
    info: Pick<
      Prisma.VerificationTokenCreateInput,
      'identifier' | 'tokenHash' | 'type'
    >,
    tx: Prisma.TransactionClient,
  ) {
    const { identifier, tokenHash, type } = info;
    const verificationToken = await tx.verificationToken.findFirst({
      where: {
        identifier,
        tokenHash,
        type,
        expires: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verificationToken)
      throw new UnauthorizedException('verify email token error');
    return verificationToken;
  }
}
