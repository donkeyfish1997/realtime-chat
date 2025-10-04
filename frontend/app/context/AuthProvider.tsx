import React, { useState, useMemo, useEffect } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { LoginResponseDtoOutputUser } from "api/models";
import { useNavigate } from "react-router";
import {
  authControllerGetAccessToken,
  authControllerLogin,
  authControllerLogout,
} from "api/auth";
import { clearAccessToken, setAccessToken } from "api/custom-instance";
import { userControllerUpdateUserBaseInfo } from "api/user";
import { useNotification } from "./NotificationContext";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notify } = useNotification();
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
  const updateBaseInfo = async (info: {
    name: string | null;
    image: string | null;
  }) => {
    if (!user) {
      notify("login to update user");
      return;
    }
    try {
      const updatedInfo = await userControllerUpdateUserBaseInfo(user.id, info);
      setUser(updatedInfo);
    } catch (error) {
      notify("update user error", "error");
    }
  };

  const logout = async () => {
    await authControllerLogout();
    clearAccessToken();
    setUser(null);
  };
  const updateEmail = (email: string) => {
    if (!user) {
      return;
    }
    setUser({ ...user, email });
  };

  useEffect(() => {
    authControllerGetAccessToken()
      .then(({ access_token, user }) => {
        setAccessToken(access_token);
        setUser(user);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () =>
      ({ user, login, logout, updateBaseInfo, updateEmail }) as AuthContextType,
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
