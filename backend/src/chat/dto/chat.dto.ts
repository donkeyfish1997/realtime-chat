import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { MessageStatus } from '@prisma/client';

const ChatSummary = z.object({
  conversationId: z.string(),
  partner: z.object({
    id: z.string(), // 對方使用者的 ID
    name: z.string(), // 對方使用者的名稱
    image: z.string().nullable(), // 對方使用者的頭像 URL
  }),
  unreadCount: z.number(), // 該對話的未讀訊息數量 (重要)
  isOnline: z.boolean(), // 對方使用者目前是否在線 (可選，但常見)
  lastMessage: z
    .object({
      id: z.string(),
      content: z.string(), // 最新訊息的內容摘要 (例如前 50 個字)
      sentByMe: z.boolean(), // 最新訊息是否由當前使用者發送
      createdAt: z.string(),
      status: z.enum(['SENT', 'DELIVERED', 'READ']), // 最新訊息的狀態
    })
    .nullable(),
});
//
export enum EmitEvent {
  MESSAGE_SEND = 'message_send',
  MESSAGE_ERROR = 'message_error',
  MESSAGE_READ = 'message_read',
  RECEIVE_PRIVATE_MESSAGE = 'receive_private_message',
  USER_READED = 'user_readed',
}
const message = z.object({
  id: z.string(),
  content: z.string(),
  status: z.enum(MessageStatus),
  sender_id: z.string(),
  created_at: z.string(),
  conversation_id: z.string(),
});

export class GetChatSummariesParamDto extends createZodDto(
  z.object({
    course: z
      .object({
        lastMessageTime: z.string(),
        conversationId: z.string(),
      })
      .optional(),
  }),
) {}
export type ChatSummary = z.infer<typeof ChatSummary>;
const chatSummaryOutputSchema = z.array(ChatSummary);
export class ChatSummaryOutputDto extends createZodDto(
  chatSummaryOutputSchema,
) {}

export class GetHistoricalMessagesParamDto extends createZodDto(
  z.object({ targetUserId: z.string() }),
) {}
export class GetHistoricalMessagesQueryDto extends createZodDto(
  z.object({ cursorLastTime: z.string().optional() }),
) {}

export type Message = z.infer<typeof message>;
const getHistoricalMessagesSchema = z.array(message);
export class GetHistoricalMessagesDto extends createZodDto(
  getHistoricalMessagesSchema,
) {}

export class MarkConversationAsReadParamDto extends createZodDto(
  z.object({ targetUserId: z.string() }),
) {}
