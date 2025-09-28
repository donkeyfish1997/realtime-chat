import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Prisma, PrismaClient, VerificationTokenType } from '@prisma/client';
type TokenType =
  (typeof VerificationTokenType)[keyof typeof VerificationTokenType];

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}
  async register(body: { email: string; password: string }) {
    const user = await this.userService.createUser(body);
    const passwordHash = await this.getPasswordHash(body.password);
    const token = this.createToken();
    const tokenHash = this.getTokenHash(token);
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all([
        this.createCredential(
          {
            email: body.email,
            passwordHash,
            userId: user.id,
          },
          tx,
        ),
        this.createValidationTokenAndExpireOlds(
          {
            identifier: body.email,
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
    return { user, token };
  }
  async verifyEmail(body: { token: string; identifier: string }) {
    const tokenHash = this.getTokenHash(body.token);
    const verificationToken = await this.getAndCheckVerifiedVerificationToken(
      {
        identifier: body.identifier,
        tokenHash,
        type: 'EMAIL_VERIFY',
      },
      this.prismaService,
    );
    if (verificationToken.user.email !== body.identifier)
      throw new UnauthorizedException('verify email token error');
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
  async requestPasswordReset(email: string) {
    const user = await this.userService.user({ email });
    if (!user) throw new UnauthorizedException('email not registered.');
    const token = this.createToken();
    const tokenHash = this.getTokenHash(token);
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
  async resetPassword(body: {
    identifier: string;
    token: string;
    newPassword: string;
  }) {
    const tokenHash = this.getTokenHash(body.token);
    const verificationToken = await this.getAndCheckVerifiedVerificationToken(
      {
        identifier: body.identifier,
        tokenHash,
        type: 'PASSWORD_RESET',
      },
      this.prismaService,
    );

    const user = verificationToken.user;
    const newPasswordHash = await this.getPasswordHash(body.newPassword);
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
    return 'change password success';
  }
  async requestChangeEmail(userId: string, newEmail: string) {
    //userId from token
    const existingUser = await this.prismaService.user.findFirst({
      where: { email: newEmail },
    });
    if (existingUser)
      throw new UnauthorizedException('email is already in use.');
    const token = this.createToken();
    const tokenHash = this.getTokenHash(token);
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
  async confirmChangeEmail(newEmail: string, token: string) {
    const tokenHash = this.getTokenHash(token);
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
    const token = this.createToken();
    const tokenHash = this.getTokenHash(token);
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
  }
  async checkTokenValid(body: {
    identifier: string;
    token: string;
    type: VerificationTokenType;
  }) {
    const tokenHash = this.getTokenHash(body.token);
    await this.getAndCheckVerifiedVerificationToken(
      { ...body, tokenHash },
      this.prismaService,
    );
    return true;
  }
  //
  // private
  //
  private createToken(): string {
    return crypto.randomBytes(32).toString('hex'); // 64字元隨機 token
  }
  private async getPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }
  private getTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
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
        await this.createValidationToken(info, tx);
        await this.setValidationTokensExpire(info.userId, info.type, tx);
      });
    } else {
      await this.createValidationToken(info, tx);
      await this.setValidationTokensExpire(info.userId, info.type, tx);
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
    return tx.verificationToken.create({
      data: {
        userId: info.userId,
        identifier: info.identifier,
        tokenHash: info.tokenHash,
        type: info.type,
        expires: new Date(Date.now() + 3600000), // 例如：一小時後過期
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
