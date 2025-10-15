type ConversationId = string;

export interface RedisStoredSetKeyMap {
  'chat.order:userId': ConversationId;
}

export type StroedSetKeyPrefix = keyof RedisStoredSetKeyMap;
