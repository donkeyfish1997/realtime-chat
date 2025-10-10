import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtUserPayload } from 'src/types/JwtUserPayload';
import { ChatService } from './chat.service';
import { ClientToServerEvents } from 'src/types/socket.types';

// 1. 提取特定事件的 ACK 回呼函式類型
type AckCallbackType<E extends keyof ClientToServerEvents> = Parameters<
  ClientToServerEvents[E]
>[1]; // 獲取事件定義函式的第二個參數 (callback)

// 2. 提取 ACK 回呼函式接收的參數類型 (也就是您想要的訊息物件)
export type AckResponse<E extends keyof ClientToServerEvents> = Parameters<
  NonNullable<AckCallbackType<E>>
>[0];

type SendMessageResponse = AckResponse<'sendPrivateMessage'>;

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayConnection
{
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  @SubscribeMessage('sendPrivateMessage')
  async handleEvent(
    @MessageBody() data: { targetUserId: string; message: string },
    @ConnectedSocket() client: Socket,
  ): Promise<SendMessageResponse> {
    const sender = client.user;
    if (!sender) {
      return { errorMessage: 'Authentication required.' };
    }
    const message = await this.chatService.sendPrivateMessage(
      sender.id,
      data.targetUserId,
      data.message,
    );

    return { ...message, created_at: message.created_at.toTimeString() };
  }
  /**
   * 處理客戶端通知伺服器已讀取訊息的事件。
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const reader = client.user;
    if (!reader) return;

    await this.chatService.markMessagesAsRead(reader.id, data.targetUserId);
  }
  //////
  //////
  //////
  handleConnection(client: Socket) {
    console.log('do handleConnection');
    // 1. 從握手資訊中獲取 Token
    const authToken = client.handshake.query.token;

    if (!authToken) {
      console.log(`連線 ${client.id} 缺乏認證，拒絕。`);
      return client.disconnect(true); // 立即斷開連線
    }
    const tokenString = Array.isArray(authToken)
      ? authToken[0]
      : authToken.toString();

    const token = tokenString.startsWith('Bearer ')
      ? tokenString.substring(7)
      : tokenString;

    try {
      const user = this.jwtService.verify<JwtUserPayload>(token);
      client.user = user;
      console.log(
        `用戶 ${user.email}, userId ${user.id} 連線成功: ${client.id}`,
      );
      this.chatService.addSocket(user.id, client.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // 4. 驗證失敗：拒絕連線
      console.log(`連線 ${client.id} 認證失敗，拒絕。`);
      return client.disconnect(true);
    }
  }
  handleDisconnect(client: Socket) {
    // 呼叫 Service 進行清理
    this.chatService.removeSocket(client.id);
  }
  afterInit(server: Server) {
    this.chatService.afterInit(server);
  }
}
