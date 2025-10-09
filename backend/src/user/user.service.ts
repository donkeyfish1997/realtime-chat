import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserBaseInfoDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    select?: Prisma.UserSelect;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.user.findMany({
      select,
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(
    data: Omit<Prisma.UserCreateInput, 'emailVerified'>,
  ): Promise<User> {
    const { name, email, image } = data;
    return this.prisma.user.create({
      data: { name, email, image },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }
  async updateUserBaseInfo(
    userId: string,
    { name, image }: UpdateUserBaseInfoDto,
  ) {
    const user = await this.updateUser({
      where: { id: userId },
      data: { name: name ?? undefined, image },
    });
    return user;
  }
  async searchUsers(query: string) {
    const userWhereInput: Prisma.UserWhereInput = query
      ? { name: { contains: query } }
      : {};
    const users = await this.prisma.user.findMany({
      where: userWhereInput,
      select: { name: true, id: true, image: true, emailVerified: false },
    });
    return users;
  }
  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
