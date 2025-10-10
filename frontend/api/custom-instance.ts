import Axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
//
//
//
// 需要改，可能會鎖死！！！！
//
//
//
//
//
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
  console.log("setGetTokenFunction");
  tokenRefreshFn = async () => {
    // console.log("do tokenRefreshFn");
    tokenRefreshPromise = (async function () {
      accessToken = null;
      try {
        // console.log("before do fn");
        const { accessToken: token, user } = await fn();
        // console.log("after do fn");
        // console.log("token", token);
        userInfo = user;
        accessToken = token;
      } catch (e) {
        accessToken = "fail";
      }
    })();
    await tokenRefreshPromise.finally(() => {
      // console.log("clear tokenRefreshFn");
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
      // console.log("if accessToken === null && tokenRefreshPromise === null");
      tokenRefreshFn();
    }
    if (tokenRefreshPromise) {
      // console.log("tokenRefreshPromise has value awiat tokenRefreshPromise");
      // 如果已經有其他請求在刷新，則直接等待鎖定 Promise
      await tokenRefreshPromise;
      // console.log("await tokenRefreshPromise finish");
    } else {
      await tokenRefreshFn();
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
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    if (accessToken === "fail") {
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
