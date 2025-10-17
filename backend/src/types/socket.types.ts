// socket.types.ts (或放在 shared/ 資料夾中)
export type Message = {
  id: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender_id: string;
  created_at: string;
  conversation_id: string;
};
// 1. 定義伺服器發送給客戶端的事件 (Server -> Client)
export interface ServerToClientEvents {
  receive_private_message: (payload: Message) => void;

  user_readed: (payload: {
    readerId: string;
    // 這裡可以加上 lastReadMessageId
  }) => void;

  // ... 其他伺服器推送事件
}

// 2. 定義客戶端發送給伺服器的事件 (Client -> Server)
export interface ClientToServerEvents {
  noEvent: () => void;
  // sendPrivateMessage: (
  //   payload: { targetUserId: string; message: string },
  //   // 這裡可以選擇性地加入 ack 回調函數的型別
  //   callback?: (response: Message | { errorMessage: string }) => void,
  // ) => void;
  // markAsRead: (payload: { targetUserId: string }) => void;
}
