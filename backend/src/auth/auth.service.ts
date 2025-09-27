import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.user({ name: username });
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  login(user: NonNullable<Awaited<ReturnType<typeof this.validateUser>>>) {
    const payload = {
      username: user.name,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload) as string,
    };
  }
}
