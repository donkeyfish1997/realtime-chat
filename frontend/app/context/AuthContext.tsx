import { createContext, useContext } from "react";
import type { LoginResponseDtoOutputUser } from "api/models";

export interface AuthContextType {
  user: (LoginResponseDtoOutputUser & { image: string }) | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBaseInfo: (info: { name: string | null; image: string | null }) => {};
  updateEmail: (email: string) => void;
}

// 使用 AuthContextType 定義 Context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async (email: string, password: string) => {},
  logout: async () => {},
  updateBaseInfo: async () => {},
  updateEmail: (email: string) => {},
});

// useAuth Hook
export const useAuth = () => useContext(AuthContext);
