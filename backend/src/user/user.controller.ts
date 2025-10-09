import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IdMatchGuard } from 'src/common/guard/id-match.guard';
import { UserService } from './user.service';
import {
  SearchUserQueryDto,
  SearchUserQueryResDto,
  UpdateUserBaseInfoDto,
  UpdateUserBaseInfoResposneDto,
} from './dto/user.dto';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(IdMatchGuard)
  @ZodResponse({ type: UpdateUserBaseInfoResposneDto })
  @Patch(':id')
  async updateUserBaseInfo(
    @Param('id') id: string,
    @Body() update: UpdateUserBaseInfoDto,
    @Req() req: Request,
  ): Promise<UpdateUserBaseInfoResposneDto> {
    const userId = req.user?.id as string;
    const user = await this.userService.updateUserBaseInfo(userId, update);
    const emailVerified = user.emailVerified?.toTimeString() ?? null;
    return { ...user, emailVerified };
  }
  @ZodResponse({ type: SearchUserQueryResDto })
  @Get('search')
  async searchUsers(@Query() { query }: SearchUserQueryDto) {
    return this.userService.searchUsers(query);
  }
}
