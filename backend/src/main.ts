import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // 允許所有來源 (包括 http://localhost:3000, http://localhost:8080 等)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Example API')
      .setDescription('Example API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '請輸入 JWT Access Token',
          in: 'header',
        },
        'access-token', // <--- 安全定義的名稱 (Security Definition Name)
      )
      .addCookieAuth(
        'refresh_token', // <--- Cookie 的鍵名 (Key Name)
        { type: 'http', description: '用於 Refresh Token 的 Cookie' },
        'refresh-cookie-scheme', // <--- 安全定義的名稱
      )
      .build(),
  );

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
