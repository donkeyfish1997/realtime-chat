import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class IdMatchGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 1. 取得 HTTP 請求物件
    const request: Request = context.switchToHttp().getRequest();

    // 2. 取得路由參數中的 ID (即 :id 的值)
    const userIdInParams = request.params.id;

    // 3. 取得當前登入使用者的 ID
    // 假設您的身份驗證（例如 JWT Guard）已將使用者資訊附加到 request.user 物件上
    // 注意：request.user.id 通常是數字，而 params.id 是字串，需要轉換。
    const loggedInUserId = request.user?.id;

    // 4. 執行比對檢查
    // 必須將其中一個轉換為字串或數字進行嚴格比較 (===)
    if (String(userIdInParams) === String(loggedInUserId)) {
      // ID 匹配，允許存取
      return true;
    }

    // 5. 如果不匹配，拋出 ForbiddenException (HTTP 403 錯誤)
    throw new ForbiddenException("don't allow update");
  }
}
