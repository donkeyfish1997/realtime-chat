import Axios, { AxiosError, type AxiosRequestConfig } from "axios";
//
//
//
// 需要改，可能會鎖死！！！！
//
//
//
//
//
Axios;
type User = {
  email: string;
  name: string;
  id: string;
  emailVerified: string | null;
  image: string | null;
};
let userInfo: User | null = null;
let accessToken: string | null = null;
let tokenRefreshFn: () => Promise<void> = async () => {
  throw "didn't set tokenRefreshFn";
};
let tokenRefreshPromise: Promise<void> | null = null; // Promise 鎖

export function setAccessTokenAndUser(token: string, user: User) {
  accessToken = token;
  userInfo = user;
}
export async function getAccessTokenAndUser(): Promise<{
  accessToken: string;
  user: User;
}> {
  if (tokenRefreshPromise) {
    await tokenRefreshPromise;
  }
  if (!accessToken || !userInfo) {
    throw "fn getAccessTokenAndUser: accessToken or userInfo is null";
  }
  return { accessToken, user: userInfo };
}

export function setGetTokenFunction(
  fn: () => Promise<{ accessToken: string; user: User }>
) {
  tokenRefreshFn = async () => {
    tokenRefreshPromise = (async function () {
      accessToken = null;
      try {
        const { accessToken: token, user } = await fn();
        userInfo = user;
        accessToken = token;
      } catch (e) {
        accessToken = "fail";
      }
    })();
    await tokenRefreshPromise.finally(() => {
      tokenRefreshPromise = null;
    });
  };
  tokenRefreshFn();
}

export const clearAccessTokenAndUser = () => {
  accessToken = null;
  userInfo = null;
};

// --- 核心 Mutator 邏輯 ---

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "/apii",
  withCredentials: true,
});

// 設定請求攔截器 (Interceptor) 來自動注入 Bearer Token
AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("auth")) {
      return config;
    }
    if (accessToken === null && tokenRefreshPromise === null) {
      await tokenRefreshFn();
    } else if (tokenRefreshPromise) {
      await tokenRefreshPromise;
    }
    if (accessToken && accessToken !== "fail") {
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
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      originalRequest?.isAuth ||
      error.response?.status !== 401 ||
      accessToken === "fail" ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }
    if (tokenRefreshPromise) {
      await tokenRefreshPromise;
    }
    return AXIOS_INSTANCE(originalRequest);
  }
);

// 這是 Orval Hooks 實際調用的函式
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await AXIOS_INSTANCE({
      ...config,
      ...options,
    });
    return response.data;
  } catch (error) {
    // 可以在這裡統一處理 401/403 錯誤，並執行登出或 Token 刷新
    throw error;
  }
};
