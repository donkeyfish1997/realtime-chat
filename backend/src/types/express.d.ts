// 匯入 Express 模組（這是關鍵步驟）
import { Request } from 'express';

// 定義你的 User 資料結構 (Payload)
interface JwtUserPayload {
  id: string;
  emailVerified: Date | null;
  email: string;
  name: string | null;
  image: string | null;
}

// 擴充 Express 的 Request 介面
// 這樣你的 Request 物件就會知道它有一個 'user' 屬性
declare module 'express' {
  interface Request {
    /**
     * @description JWT 策略驗證成功後，附加在 Request 上的使用者資料。
     */
    user?: JwtUserPayload; // 使用可選屬性，因為並非所有路由都有 user
  }
}
