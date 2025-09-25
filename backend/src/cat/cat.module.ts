import { Module } from '@nestjs/common';
import { CatController } from './cat.controller';
import { AdminController } from './admin/admin.controller';

@Module({
  controllers: [CatController, AdminController],
})
export class CatModule {}
