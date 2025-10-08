// socket.types.ts (或放在 shared/ 資料夾中)

// 1. 定義伺服器發送給客戶端的事件 (Server -> Client)
export interface ServerToClientEvents {
  receive_private_message: (payload: {
    id: string; // 訊息在 DB 中的 ID
    from: string; // 發送者 ID
    text: string;
    timestamp: string;
    // ... 其他訊息數據
  }) => void;

  user_readed: (payload: {
    conversationId: string;
    // 這裡可以加上 lastReadMessageId
  }) => void;

  // ... 其他伺服器推送事件
}

// 2. 定義客戶端發送給伺服器的事件 (Client -> Server)
export interface ClientToServerEvents {
  sendPrivateMessage: (
    payload: { targetUserId: string; message: string },
    // 這裡可以選擇性地加入 ack 回調函數的型別
    callback?: (response: { status: 'OK' | 'FAILED'; reason?: string }) => void,
  ) => void;

  markAsRead: (payload: { targetUserId: string }) => void;
}

// 3. 定義雙向通用的型別（可選，例如用於錯誤）
export interface InterServerEvents {
  // ...
}

// 4. 定義 Socket 數據 (例如，在驗證後附加到 Socket 物件上的數據)
export interface SocketData {
  user: {
    id: string;
    name: string;
  };
}
