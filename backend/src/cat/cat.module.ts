import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CatController } from './cat.controller';
import { AdminController } from './admin/admin.controller';
import { CatService } from './cat.service';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';

@Module({
  controllers: [CatController, AdminController],
  providers: [CatService],
})
export class CatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatController);
  }
}
