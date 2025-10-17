import { Injectable } from '@nestjs/common';
import { Server as SocketIoServer } from 'socket.io';
import {
  ClientToServerEvents,
  Message,
  ServerToClientEvents,
} from '../types/socket.types';

type Server = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

@Injectable()
export class ChatSocketService {
  private server: Server;
  private userSocketMap: Map<string, Set<string>> = new Map();
  private socketUserMap: Map<string, string> = new Map();
  constructor() {}

  afterInit(server: Server) {
    if (!this.server) {
      this.server = server;
    }
  }

  sendPrivateMessage(senderId: string, targetUserId: string, message: Message) {
    const targetSocketIds = this.findSocketsByUserId(targetUserId); // 假設返回 string[]
    const hasActiveConnection = targetSocketIds.length > 0;

    // 2. 判斷是否有活躍連線，並嘗試即時轉發
    if (hasActiveConnection) {
      // 執行即時轉發
      console.log(
        `send userId ${senderId} :targetSocketIds ${targetSocketIds[0]}`,
      );
      this.server.to(targetSocketIds).emit('receive_private_message', {
        ...message,
      });
    }
  }

  markMessagesAsRead(readerId: string, targetUserId: string): void {
    const targetSocketIds = this.findSocketsByUserId(targetUserId);
    targetSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('user_readed', { readerId });
    });
  }
  //
  //
  //
  addSocket(userId: string, socketId: string): void {
    // 1. 更新 userSocketMap (支援多重登入)
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    (this.userSocketMap.get(userId) as Set<string>).add(socketId);
    // 2. 更新 socketUserMap (用於快速查找和清理)
    this.socketUserMap.set(socketId, userId);
  }

  /**
   * 當一個 Socket 連線斷開時呼叫
   * @param socketId 斷開連線的 Socket ID
   */
  removeSocket(socketId: string): void {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      // 1. 從 userSocketMap 中移除該 Socket ID
      const sockets = this.userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        // 如果該用戶的所有連線都斷開了，則從 Map 中移除該用戶
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
      }
      // 2. 從 socketUserMap 中移除該 Socket ID
      this.socketUserMap.delete(socketId);

      console.log(`[ChatService] ${userId} 斷開連線。`);
    }
  }
  private findSocketsByUserId(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId) ?? [];
    return Array.from(sockets);
  }
}
