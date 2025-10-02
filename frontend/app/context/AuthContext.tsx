import { createContext, useContext } from "react";

export interface User {
  email: string;
  avatarUrl: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 使用 AuthContextType 定義 Context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async (email: string, password: string) => {},
  logout: async () => {},
});

// useAuth Hook
export const useAuth = () => useContext(AuthContext);
