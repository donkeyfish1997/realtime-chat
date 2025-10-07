import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService, ChatSummary } from './chat.service';
import { type Request } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('summaries')
  async getChatSummaries(@Req() req: Request): Promise<ChatSummary[]> {
    return this.chatService.fetchInitialChatSummary(req.user?.id as string);
  }

  @Get('messages/:targetUserId')
  getMessages(
    @Req() req: Request,
    @Param('targetUserId') targetUserId: string,
    @Query('cursorLastTime') cursorLastTime: Date, // 用於分頁的游標
  ) {
    // 呼叫 Service 查詢資料庫，獲取歷史訊息
    return this.chatService.fetchHistoricalMessages(
      req.user?.id as string,
      targetUserId,
      cursorLastTime,
    );
  }

  @Post('read/:targetUserId')
  async markConversationAsRead(
    @Req() req: Request,
    @Param('targetUserId') targetUserId: string,
  ) {
    // 呼叫 Service 更新資料庫的 status 欄位，並清零未讀計數
    return this.chatService.markMessagesAsRead(
      req.user?.id as string,
      targetUserId,
    );
  }
}
