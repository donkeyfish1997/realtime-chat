import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { type Request } from 'express';
import {
  ChatSummaryOutputDto,
  GetChatSummariesParamDto,
  GetHistoricalMessagesDto,
  GetHistoricalMessagesParamDto,
  GetHistoricalMessagesQueryDto,
  MarkConversationAsReadParamDto,
  SendPrivateMessageDto,
  SendPrivateMessageParamDto,
  SendPrivateMessageReturnDto,
} from './dto/chat.dto';
import { ZodResponse } from 'nestjs-zod';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
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
    return messages;
  }

  @Post('message/:targetUserId')
  @ZodResponse({ type: SendPrivateMessageReturnDto })
  async sendPrivateMessage(
    @Req() req: Request,
    @Param() { targetUserId }: SendPrivateMessageParamDto,
    @Body() body: SendPrivateMessageDto,
  ) {
    const message = await this.chatService.sendPrivateMessage(
      req.user?.id as string,
      targetUserId,
      body.message,
    );

    return { ...message, created_at: message.created_at.toISOString() };
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
