import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtUserPayload } from 'src/types/JwtUserPayload';
import { ChatSocketService } from './chat-socket.service';

@WebSocketGateway()
export class ChatSocketGetway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayConnection
{
  constructor(
    private jwtService: JwtService,
    private chatSocketService: ChatSocketService,
  ) {}
  handleConnection(client: Socket) {
    console.log('do handleConnection');
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
      this.chatSocketService.addSocket(user.id, client.id);
    } catch (e) {
      // 4. 驗證失敗：拒絕連線
      console.log(`連線 ${client.id} 認證失敗，拒絕。`, e);
      return client.disconnect(true);
    }
  }
  handleDisconnect(client: Socket) {
    // 呼叫 Service 進行清理
    this.chatSocketService.removeSocket(client.id);
  }
  afterInit(server: Server) {
    this.chatSocketService.afterInit(server);
  }
}
