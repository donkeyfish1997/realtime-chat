import { Injectable } from '@nestjs/common';
import { Server as SocketIoServer } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/socket.types';
import { ChatSummary, EmitEvent, Message } from './dto/chat.dto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { LastMessage } from 'src/redis/type';
type Server = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

@Injectable()
export class ChatService {
  private server: Server;
  private userSocketMap: Map<string, Set<string>> = new Map();
  private socketUserMap: Map<string, string> = new Map();
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly redis: RedisService,
  ) {}

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
  ) {
    const targetSocketIds = this.findSocketsByUserId(targetUserId); // 假設返回 string[]
    const hasActiveConnection = targetSocketIds.length > 0;
    const now = new Date(); // 使用 Date 物件，Prisma 處理更安全

    const conversationId = this.getConversationId(senderId, targetUserId);

    // 1. 確保所有訊息都先寫入 DB，初始狀態為 SENT
    const messageRecord = await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        content: message,
        status: 'SENT', // 初始狀態必須是 SENT
        created_at: now,
      },
    });

    // 2. 判斷是否有活躍連線，並嘗試即時轉發
    if (hasActiveConnection) {
      // 執行即時轉發
      console.log(
        `send userId ${messageRecord.sender_id} :targetSocketIds ${targetSocketIds[0]}`,
      );
      this.server.to(targetSocketIds).emit(EmitEvent.RECEIVE_PRIVATE_MESSAGE, {
        ...messageRecord,
        created_at: messageRecord.created_at.toISOString(),
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
    }
    this.redis
      .zadd('chat.order:userId', senderId, [
        { value: conversationId, score: now.getTime() },
      ])
      .catch(() => {});
    this.redis
      .zadd('chat.order:userId', targetUserId, [
        { value: conversationId, score: now.getTime() },
      ])
      .catch(() => {});
    this.redis
      .hSet('base.conversation.info:conversationId', conversationId, {
        lastMessage: {
          ...messageRecord,
          created_at: messageRecord.created_at.toISOString(),
        },
      })
      .catch(() => {});

    this.redis
      .hIncrby(
        'base.conversation.info:conversationId',
        conversationId,
        `unreadCount:${targetUserId}`,
        1,
      )
      .catch(() => {});

    return messageRecord;
  }

  async fetchInitialChatSummary(
    userId: string,
    cursor?: { lastMessageTime: Date; conversationId: string },
    limit: number = 20,
  ): Promise<ChatSummary[]> {
    const conversationOrderInfos = await this.getOrderConversationIds(
      userId,
      cursor,
      limit,
    );
    const promiseSummaries: Promise<ChatSummary>[] = conversationOrderInfos.map(
      async ({ conversationId }) => {
        const { message, unreadCount } =
          await this.getLastMessageAndUnReadCount(userId, conversationId);
        const isSendByBe = message.sender_id === userId;
        const partnerUserId = isSendByBe
          ? this.getPartnerId(conversationId, userId)
          : message.sender_id;
        const partnerUser = await this.userService.user({ id: partnerUserId });
        if (!partnerUser)
          throw new Error(`can't find user, userId = ${partnerUserId}`);
        return {
          conversationId: conversationId,
          unreadCount,
          isOnline: this.findSocketsByUserId(partnerUser.id).length > 0,
          partner: {
            id: partnerUser.id,
            name: partnerUser.name,
            image: partnerUser.image,
          },
          lastMessage: message,
        };
      },
    );
    const summaries = Promise.all(promiseSummaries);
    // 由於 conversationOrderInfos 是已經排序好的，所以 summaries 也是排序好的
    return summaries;
  }

  async getHistoricalMessages(
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
    return messages.map((m) => ({
      ...m,
      created_at: m.created_at.toISOString(),
    }));
  }

  async markMessagesAsRead(
    readerId: string,
    targetUserId: string,
  ): Promise<void> {
    const updateResult = await this.prisma.message.updateMany({
      data: { status: 'READ' },
      where: {
        sender_id: targetUserId,
        status: { not: 'READ' },
      },
    });
    if (updateResult.count === 0) {
      return;
    }
    const targetSocketIds = this.findSocketsByUserId(targetUserId);
    targetSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit(EmitEvent.USER_READED, { readerId });
    });
    const conversationId = this.getConversationId(readerId, targetUserId);
    this.redis
      .hSet('base.conversation.info:conversationId', conversationId, {
        [`unreadCount:${readerId}`]: 0,
      })
      .catch(() => {});
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
  private getPartnerId(conversationId: string, userId: string): string {
    let partnerId: string | undefined;
    if (conversationId.startsWith(userId)) {
      partnerId = conversationId.replace(userId + '_', '');
    }
    if (conversationId.endsWith(userId)) {
      partnerId = conversationId.replace('_' + userId, '');
    }
    if (!partnerId) {
      throw new Error(
        `can not fint partnerId from conversationId, ${conversationId}`,
      );
    }
    return partnerId;
  }
  private async getOrderConversationIds(
    userId: string,
    cursor?: { lastMessageTime: Date; conversationId: string },
    limit: number = 20,
  ): Promise<{ conversationId: string; lastMessageTime: Date }[]> {
    if (!cursor) {
      const conversationInfos = await this.redis.zRangeWithScores(
        'chat.order:userId',
        userId,
        '+inf',
        '-inf',
        {
          REV: true,
          LIMIT: { count: limit, offset: 0 },
          BY: 'SCORE',
        },
      );
      if (conversationInfos.length)
        return conversationInfos.map((i) => ({
          conversationId: i.value,
          lastMessageTime: new Date(i.score),
        }));
    }

    const startPattern = `${userId}\\_%`;
    const endPattern = `%\\_${userId}`;
    // 1. 定義基礎查詢
    let query = Prisma.sql`
      SELECT
        conversation_id as "conversationId",
        MAX(created_at) AS "lastMessageTime"
      FROM
        messages
       WHERE
        conversation_id LIKE ${startPattern}
        OR conversation_id LIKE ${endPattern}
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
        MAX(created_at) DESC,
        "conversationId" ASC
      LIMIT ${limit}
    `;
    // 4. 執行查詢 (Prisma 會在內部安全地合併所有參數)
    const conversationInfos =
      await this.prisma.$queryRaw<
        { conversationId: string; lastMessageTime: Date }[]
      >(query);
    this.redis
      .zadd(
        'chat.order:userId',
        userId,
        conversationInfos.map((i) => ({
          score: i.lastMessageTime.getTime(),
          value: i.conversationId,
        })),
      )
      .catch(() => {});
    return conversationInfos;
  }
  private async getLastMessageAndUnReadCount(
    userId: string,
    conversationId: string,
  ): Promise<{ message: Message; unreadCount: number }> {
    const unReadKey: `unreadCount:${any}` = `unreadCount:${userId}`;
    const { lastMessage, [unReadKey]: count } = (await this.redis.hMGet(
      'base.conversation.info:conversationId',
      conversationId,
      ['lastMessage', unReadKey],
    )) as {
      [x: `unreadCount:${any}`]: number | null | undefined;
      lastMessage: LastMessage | null | undefined;
    };
    if (lastMessage && (count || count === 0)) {
      return { message: lastMessage, unreadCount: count };
    }
    const message = await this.prisma.message.findFirstOrThrow({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'desc' },
    });
    const unreadCount = await this.prisma.message.count({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        status: { not: 'READ' },
      },
    });
    this.redis
      .hSet('base.conversation.info:conversationId', conversationId, {
        lastMessage: {
          ...message,
          created_at: message.created_at.toISOString(),
        },
        [unReadKey]: unreadCount,
      } as any)
      .catch(() => {});
    return {
      message: { ...message, created_at: message.created_at.toISOString() },
      unreadCount: unreadCount,
    };
  }
}
