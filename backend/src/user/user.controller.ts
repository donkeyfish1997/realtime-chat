import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { IdMatchGuard } from 'src/common/guard/id-match.guard';
import { UserService } from './user.service';
import {
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
    console.log('userId', userId);
    console.log('req.user', req.user);
    console.log(
      'this.userService.updateUserBaseInfo',
      typeof this.userService.updateUserBaseInfo,
    );
    const user = await this.userService.updateUserBaseInfo(userId, update);
    const emailVerified = user.emailVerified?.toTimeString() ?? null;
    return { ...user, emailVerified };
  }
}
