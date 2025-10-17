import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessageService } from './message.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'message',
          queueOptions: {
            durable: false,
            autoDelete: true,
          },
        },
      },
    ]),
  ],
  providers: [MessageService],
})
export class MessageModule {}
