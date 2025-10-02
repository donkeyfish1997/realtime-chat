import React, { useState, useMemo, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import api from "~/services/api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const { name, refreshToken } = await api.login(email, password);
    setUser({
      email: email,
      avatarUrl: "https://i.pravatar.cc/300?img=68",
    });
  };

  const logout = async () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
