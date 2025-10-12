import "axios"; // 確保檔案被識別為一個模組擴充文件

declare module "axios" {
  // 只需要擴充 AxiosRequestConfig
  // 這是您在呼叫 axios(config) 時傳入的類型
  export interface AxiosRequestConfig {
    /**
     * 自訂身份驗證標誌。
     */
    isAuth?: boolean; // 建議使用更簡單的布林值，方便傳遞
  }
}
