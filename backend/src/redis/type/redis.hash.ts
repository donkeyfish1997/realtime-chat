type UserId = string;
export interface LastMessage {
  id: string;
  content;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender_id: string;
  created_at: string;
  conversation_id: string;
}
export interface BaseConversationRoomInfo {
  lastMessage?: LastMessage;
  [key: `unreadCount:${UserId}`]: number | undefined;
}

export interface BaseConversationRoomInfoTEST {
  lastMessage: {
    id: string;
    // ....
  };
  [key: `unreadCount:${UserId}`]: number;
}

export interface RedisHashKeyMap {
  'base.conversation.info:conversationId': BaseConversationRoomInfo;
  // 'base.conversation.info:conversationI1': { abc: string };
}

export type HashKeyPrefix = keyof RedisHashKeyMap;
