import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessageService } from './message.service';
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT;
if (!RABBITMQ_USER || !RABBITMQ_PASSWORD || !RABBITMQ_HOST || !RABBITMQ_PORT)
  throw new Error('no RABBITMQ_USER or RABBITMQ_PASSWORD config');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
          ],
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
