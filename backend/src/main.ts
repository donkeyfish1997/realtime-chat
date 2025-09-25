import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.set('query parser', 'extended'); // if query is complicate
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
