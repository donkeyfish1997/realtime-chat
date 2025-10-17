export type Message = {
  id: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender_id: string;
  created_at: string;
  conversation_id: string;
};
export type ChannelPayload =
  | {
      type: 'new_message';
      payload: { sanderUserId: string; targetUserId: string; message: Message };
    }
  | { type: 'read_receipt'; payload: { readerId: string; toUser: string } };
