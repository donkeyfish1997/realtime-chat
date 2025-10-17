import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessageService } from './message.service';
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
if (!RABBITMQ_USER || !RABBITMQ_PASSWORD)
  throw new Error('no RABBITMQ_USER or RABBITMQ_PASSWORD config');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672`],
          queue: 'message',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
