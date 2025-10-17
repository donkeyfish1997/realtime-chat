import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import {
  Pattern,
  type NewMessagePayload,
  type ReadReceiptPayload,
} from './types/message.rabbitmq.type';
import { ChatSocketService } from './chat-socket.service';
@Controller('chat-socket')
export class ChatSocketController {
  constructor(private chatSocketService: ChatSocketService) {}

  @EventPattern(Pattern.NEW_MESSAGE)
  handleNewMessage(
    @Payload() payload: NewMessagePayload,
    @Ctx() context: RmqContext,
  ) {
    const { sanderUserId, targetUserId, message } = payload;
    this.chatSocketService.sendPrivateMessage(
      sanderUserId,
      targetUserId,
      message,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef() as Channel;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMsg = context.getMessage() as Message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(originalMsg); // 進行手動確認
  }

  @EventPattern(Pattern.READ_RECEIPT)
  readRecipt(
    @Payload() payload: ReadReceiptPayload,
    @Ctx() context: RmqContext,
  ) {
    const { toUser, readerId } = payload;
    this.chatSocketService.markMessagesAsRead(readerId, toUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef() as Channel;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMsg = context.getMessage() as Message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(originalMsg); // 進行手動確認
  }
}
