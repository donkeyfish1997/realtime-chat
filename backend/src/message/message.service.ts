import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChannelPayload } from './types/message.rabbitmq.type';

@Injectable()
export class MessageService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('RMQ_SERVICE') private client: ClientProxy) {}
  emit({ type, payload }: ChannelPayload) {
    this.client.emit(type, payload);
  }
  async onModuleInit() {
    await this.client.connect();
  }
  async onModuleDestroy() {
    await this.client.close();
  }
}
