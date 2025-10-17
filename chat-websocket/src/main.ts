import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
if (!RABBITMQ_USER || !RABBITMQ_PASSWORD)
  throw new Error('no RABBITMQ_USER or RABBITMQ_PASSWORD config');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. 連接 RabbitMQ Microservice Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      noAck: false,
      urls: [`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672`],
      queue: 'message',
      queueOptions: {
        durable: false, // 保持一致（如果這是您另一個衝突的durable設定）
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000); // 選擇一個 Port 讓 WebSocket 連接
}
bootstrap();
