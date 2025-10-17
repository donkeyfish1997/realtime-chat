// 匯入 Express 模組（這是關鍵步驟）
import { JwtUserPayload } from '../types copy/JwtUserPayload';

// 擴充 Express 的 Request 介面
// 這樣你的 Request 物件就會知道它有一個 'user' 屬性
declare module 'socket.io' {
  interface Socket {
    user?: JwtUserPayload; // 使用可選屬性，因為並非所有路由都有 user
  }
}
