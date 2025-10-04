import Axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// --- 輔助函式：Token 管理 ---

// 1. 儲存 Token 到持久化儲存 (例如 localStorage)
export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

// 2. 獲取 Token
const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// 3. 清除 Token (登出時使用)
export const clearAccessToken = () => {
  localStorage.removeItem("accessToken");
};

// --- 核心 Mutator 邏輯 ---

export const AXIOS_INSTANCE = Axios.create({});

// 設定請求攔截器 (Interceptor) 來自動注入 Bearer Token
AXIOS_INSTANCE.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAccessToken();

    // 只有在 Token 存在時才加入 Authorization 標頭
    if (token) {
      config.headers = config.headers || {};
      // 注入 Bearer Token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 這是 Orval Hooks 實際調用的函式
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  // 注意：這裡不需要再手動操作 headers，因為我們已經在攔截器中處理了
  try {
    const response: AxiosResponse<T> = await AXIOS_INSTANCE({
      ...config,
      ...options,
    });
    return response.data;
  } catch (error) {
    // 可以在這裡統一處理 401/403 錯誤，並執行登出或 Token 刷新
    throw error;
  }
};
