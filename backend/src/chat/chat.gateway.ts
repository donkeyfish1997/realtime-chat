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

    // @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const sender = client.user;
    if (!sender) {
      client.emit('error', 'Authentication required.');
      return;
    }
    await this.chatService.sendPrivateMessage(
      sender.id,
      data.targetUserId,
      data.message,
    );
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
    // 1. 從握手資訊中獲取 Token
    const authToken =
      client.handshake.query.token || client.handshake.headers.authorization;

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
      console.log(`用戶 ${user.email} 連線成功: ${client.id}`);
      this.chatService.addSocket(user.id, client.id);
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
