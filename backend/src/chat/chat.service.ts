import { Injectable } from '@nestjs/common';
import { Server as SocketIoServer } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, type Message } from '@prisma/client';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../types/socket.types';
type Server = SocketIoServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export interface ChatSummary {
  // 1. 對話資訊
  conversationId: string; // 對話的唯一 ID (例如 "userA-userB")
  partner: {
    // 對方使用者的資訊
    id: string; // 對方使用者的 ID
    name: string | null; // 對方使用者的名稱
    image: string | null; // 對方使用者的頭像 URL
  };

  // 2. 狀態資訊
  unreadCount: number; // 該對話的未讀訊息數量 (重要)
  isOnline: boolean; // 對方使用者目前是否在線 (可選，但常見)

  // 3. 最新訊息的摘要
  lastMessage: {
    id: string;
    content: string; // 最新訊息的內容摘要 (例如前 50 個字)
    sentByMe: boolean; // 最新訊息是否由當前使用者發送
    createdAt: Date;
    status: 'SENT' | 'DELIVERED' | 'READ'; // 最新訊息的狀態
  } | null; // 如果是新對話，可能為 null
}
enum EmitEvent {
  MESSAGE_SEND = 'message_send',
  MESSAGE_ERROR = 'message_error',
  MESSAGE_READ = 'message_read',
  RECEIVE_PRIVATE_MESSAGE = 'receive_private_message',
  USER_READED = 'user_readed',
}

@Injectable()
export class ChatService {
  private server: Server;
  private prisma: PrismaService;
  private userSocketMap: Map<string, Set<string>> = new Map();
  private socketUserMap: Map<string, string> = new Map();

  afterInit(server: Server) {
    if (!this.server) {
      this.server = server;
    }
  }
  addSocket(userId: string, socketId: string): void {
    // 1. 更新 userSocketMap (支援多重登入)
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    (this.userSocketMap.get(userId) as Set<string>).add(socketId);
    // 2. 更新 socketUserMap (用於快速查找和清理)
    this.socketUserMap.set(socketId, userId);
    console.log(
      `[ChatService] ${userId} 已連線，總連線數: ${this.userSocketMap.get(userId)?.size ?? 0}`,
    );
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

  async sendPrivateMessage(
    senderId: string,
    targetUserId: string,
    message: string,
  ): Promise<any> {
    const targetSocketIds = this.findSocketsByUserId(targetUserId); // 假設返回 string[]
    const hasActiveConnection = targetSocketIds.length > 0;
    const now = new Date(); // 使用 Date 物件，Prisma 處理更安全

    const conversationId = this.getConversationId(senderId, targetUserId);

    // 1. 確保所有訊息都先寫入 DB，初始狀態為 SENT
    const messageRecord = await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: targetUserId,
        content: message,
        status: 'SENT', // 初始狀態必須是 SENT
        created_at: now,
      },
    });

    // 2. 判斷是否有活躍連線，並嘗試即時轉發
    if (hasActiveConnection) {
      // 執行即時轉發
      this.server.to(targetSocketIds).emit(EmitEvent.RECEIVE_PRIVATE_MESSAGE, {
        id: messageRecord.id, // 帶上 DB ID
        from: senderId,
        text: message,
        timestamp: now.toISOString(),
        // 這裡可以加上狀態標記，讓客戶端顯示雙勾
      });

      // 不需要 await，讓主流程盡快返回
      this.prisma.message
        .update({
          where: { id: messageRecord.id },
          data: { status: 'DELIVERED' },
        })
        .catch((e) =>
          console.error('Failed to update message status to DELIVERED:', e),
        );

      return { status: 'OK', delivered: true, timestamp: now.toISOString() };
    } else {
      return {
        status: 'FAILED',
        reason: 'User Offline',
        timestamp: now.toISOString(),
      };
    }
  }

  async fetchInitialChatSummary(
    userId: string,
    limit: number = 20,
    cursor?: { lastMessageTime: Date; conversationId: string },
  ): Promise<ChatSummary[]> {
    // 1. 定義基礎查詢
    let query = Prisma.sql`
    SELECT 
      conversation_id as "conversationId",
      MAX(created_at) AS "lastMessageTime"
    FROM 
      messages 
    WHERE 
      sender_id = ${userId} OR recipient_id = ${userId} 
    GROUP BY 
      conversation_id
  `;

    // 2. 安全地加入 HAVING 條件和游標參數
    if (cursor) {
      // 🔴 使用 Prisma.sql 傳遞游標參數，確保安全
      const havingCondition = Prisma.sql`
      HAVING 
        MAX(created_at) < ${cursor.lastMessageTime}  
        OR 
        (
          MAX(created_at) = ${cursor.lastMessageTime} 
          AND conversation_id > ${cursor.conversationId}
        )
    `;
      // 將 HAVING 條件附加到主查詢
      query = Prisma.sql`${query} ${havingCondition}`;
    }

    // 3. 安全地加入 ORDER BY 和 LIMIT
    query = Prisma.sql`
    ${query} 
    ORDER BY 
      "lastMessageTime" DESC,
      "conversationId" ASC
    LIMIT ${limit}
  `;

    // 4. 執行查詢 (Prisma 會在內部安全地合併所有參數)
    const conversationInfos =
      await this.prisma.$queryRaw<
        { conversationId: string; lastMessageTime: Date }[]
      >(query);
    const conversationIds = conversationInfos.map((i) => i.conversationId);

    // 建立一個複雜的 OR 條件來精確匹配最新的 20 條訊息
    const latestMessageConditions = conversationInfos.map((c) => ({
      AND: [
        { conversation_id: c.conversationId },
        { created_at: c.lastMessageTime },
      ],
    }));
    const latestMessages = await this.prisma.message.findMany({
      where: {
        OR: latestMessageConditions, // 批量查詢這 20 條訊息
      },
      include: {
        senderUser: true,
        recipientUser: true,
      },
    });

    // 2B: 獲取所有未讀計數
    const unreadCounts = await this.prisma.message.groupBy({
      by: ['conversation_id'],
      where: {
        conversation_id: { in: conversationIds },
        recipient_id: userId,
        status: { not: 'READ' },
      },
      _count: {
        id: true,
      },
    });
    const unreadMap = new Map(
      unreadCounts.map((u) => [u.conversation_id, u._count.id]),
    );
    const summaryMap = new Map(
      latestMessages.map((m) => [m.conversation_id, m]),
    );
    const summaries: ChatSummary[] = [];
    for (const info of conversationInfos) {
      const latestMessage = summaryMap.get(info.conversationId);
      if (!latestMessage) continue;
      const notReadCount = unreadMap.get(info.conversationId) ?? 0;

      // 判斷對方是誰
      const isSender = latestMessage.sender_id === userId;
      const partnerUser = isSender
        ? latestMessage.recipientUser
        : latestMessage.senderUser;

      summaries.push({
        conversationId: info.conversationId,
        unreadCount: notReadCount,
        isOnline: this.findSocketsByUserId(partnerUser.id).length > 0,
        partner: {
          id: partnerUser.id,
          name: partnerUser.name,
          image: partnerUser.image,
        },
        lastMessage: {
          id: latestMessage.id,
          content: latestMessage.content,
          sentByMe: isSender,
          createdAt: latestMessage.created_at,
          status: latestMessage.status,
        },
      });
    }

    // 由於 conversationInfos 是已經排序好的，所以 summaries 也是排序好的
    return summaries;
  }

  async fetchHistoricalMessages(
    senderId: string,
    targetUserId: string,
    cursorLastTime?: Date,
  ): Promise<Message[]> {
    const conversationId = this.getConversationId(senderId, targetUserId);

    // 1. 建立基礎 where 條件
    const whereCondition: Prisma.MessageWhereInput = {
      conversation_id: conversationId,
    };
    if (cursorLastTime) {
      whereCondition.created_at = { lt: cursorLastTime };
    }

    const messages = await this.prisma.message.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    return messages;
  }

  async markMessagesAsRead(
    readerId: string,
    targetUserId: string,
  ): Promise<void> {
    const updateResult = await this.prisma.message.updateMany({
      data: { status: 'READ' },
      where: {
        sender_id: targetUserId,
        recipient_id: readerId,
        status: { not: 'READ' },
      },
    });
    if (updateResult.count === 0) {
      return;
    }
    const targetSocketIds = this.findSocketsByUserId(targetUserId);
    const conversationId = this.getConversationId(readerId, targetUserId);
    targetSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit(EmitEvent.USER_READED, { conversationId });
    });
  }
  //
  // private
  //
  private findSocketsByUserId(userId: string): string[] {
    const sockets = this.userSocketMap.get(userId) ?? [];
    return Array.from(sockets);
  }
  private getConversationId(userId, userId2): string {
    if (userId === userId2) {
      throw new Error("get ConversationId can't pass same userId.");
    }
    if (userId < userId2) {
      return `${userId}_${userId2}`;
    }
    return `${userId2}_${userId}`;
  }
}
