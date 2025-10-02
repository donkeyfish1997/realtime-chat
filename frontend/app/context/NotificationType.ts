// 定義通知的嚴重程度，對應 MUI Alert 的 severity
export type AlertSeverity = "success" | "info" | "warning" | "error";

// 定義通知物件的結構
export interface Notification {
  id: number;
  message: string;
  severity: AlertSeverity;
}

// 定義 Context 中提供的 API 結構 (即 useNotification Hook 的返回值)
export interface NotificationContextType {
  notify: (message: string, severity?: AlertSeverity) => void;
}
