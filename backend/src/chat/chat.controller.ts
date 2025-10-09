import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { type Request } from 'express';
import {
  ChatSummaryOutputDto,
  GetChatSummariesParamDto,
  GetHistoricalMessagesDto,
  GetHistoricalMessagesParamDto,
  GetHistoricalMessagesQueryDto,
  MarkConversationAsReadParamDto,
} from './dto/chat.dto';
import { ZodResponse } from 'nestjs-zod';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ZodResponse({ type: ChatSummaryOutputDto })
  @Get('summaries')
  async getChatSummaries(
    @Req() req: Request,
    @Param() { course: _course }: GetChatSummariesParamDto,
  ): Promise<ChatSummaryOutputDto> {
    const course = _course
      ? { ..._course, lastMessageTime: new Date(_course.lastMessageTime) }
      : undefined;
    return this.chatService.fetchInitialChatSummary(
      req.user?.id as string,
      course,
    );
  }

  @Get('messages/:targetUserId')
  @ZodResponse({ type: GetHistoricalMessagesDto })
  async getHistoricalMessages(
    @Req() req: Request,
    @Param() { targetUserId }: GetHistoricalMessagesParamDto,
    @Query() { cursorLastTime }: GetHistoricalMessagesQueryDto,
  ) {
    const messages = await this.chatService.getHistoricalMessages(
      req.user?.id as string,
      targetUserId,
      cursorLastTime ? new Date(cursorLastTime) : undefined,
    );
    console.log('messagesmessagesmessages', messages);
    return messages;
  }

  @Post('read/:targetUserId')
  async markConversationAsRead(
    @Req() req: Request,
    @Param() { targetUserId }: MarkConversationAsReadParamDto,
  ) {
    // 呼叫 Service 更新資料庫的 status 欄位，並清零未讀計數
    return this.chatService.markMessagesAsRead(
      req.user?.id as string,
      targetUserId,
    );
  }
}
