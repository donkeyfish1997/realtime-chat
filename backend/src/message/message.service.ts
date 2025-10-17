import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
export type Message = {
  id: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender_id: string;
  created_at: string;
  conversation_id: string;
};
type EmitType =
  | { type: 'new_message'; payload: Message }
  | { type: 'read_receipt'; payload: { readerId: string; toUser: string } };

@Injectable()
export class MessageService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('RMQ_SERVICE') private client: ClientProxy) {}
  emit({ type, payload }: EmitType) {
    this.client.emit(type, payload);
  }
  async onModuleInit() {
    await this.client.connect();
  }
  async onModuleDestroy() {
    await this.client.close();
  }
}
