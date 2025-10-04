import React, { useState, useMemo, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginResponseDtoOutputUser } from "api/models";
import { useNavigate } from "react-router";
import {
  authControllerGetAccessToken,
  authControllerLogin,
  authControllerLogout,
} from "api/auth";
import { clearAccessToken, setAccessToken } from "api/custom-instance";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<LoginResponseDtoOutputUser | null>(null);

  const login = async (email: string, password: string) => {
    const { user, access_token } = await authControllerLogin({
      email,
      password,
    });
    setAccessToken(access_token);
    setUser(user);
    navigate("/");
  };

  const logout = async () => {
    await authControllerLogout();
    clearAccessToken();
    setUser(null);
  };

  useEffect(() => {
    authControllerGetAccessToken().then(({ access_token, user }) => {
      setAccessToken(access_token);
      setUser(user);
    });
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
