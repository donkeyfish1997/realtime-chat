import Axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

let accessToken: string | null = null;
export const setAccessToken = (token: string) => {
  console.log("setAccessToken", token);
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

// --- 核心 Mutator 邏輯 ---

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "/apii",
  withCredentials: true,
});

// 設定請求攔截器 (Interceptor) 來自動注入 Bearer Token
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      // 注入 Bearer Token
      config.headers.Authorization = `Bearer ${accessToken}`;
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
  try {
    console.log("do customInstance"); //這裡有執行到
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
