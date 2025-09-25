import { Controller, Get } from '@nestjs/common';

// @Controller('admin/cat')
@Controller('users/:userId/posts')
export class AdminController {
  @Get()
  inAdmin() {
    return 'you are in cat admin !';
  }
}
