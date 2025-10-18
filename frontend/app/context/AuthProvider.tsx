import { useState, useMemo, useEffect } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { LoginResponseDtoOutputUser } from "api/models";
import { useNavigate } from "react-router";
import { authControllerLogin, authControllerLogout } from "api/auth";
import {
  clearAccessTokenAndUser,
  getAccessTokenAndUser,
  setAccessTokenAndUser,
} from "api/custom-instance";
import { userControllerUpdateUserBaseInfo } from "api/user";
import { useNotification } from "./NotificationContext";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [user, setUser] = useState<
    (LoginResponseDtoOutputUser & { image: string }) | null
  >(null);

  const login = async (email: string, password: string) => {
    try {
      const { user, access_token } = await authControllerLogin(
        {
          email,
          password,
        },
        { isPublic: true }
      );

      setAccessTokenAndUser(access_token, user);
      setUser({
        ...user,
        image: user.image ?? getRendomAvatorUrl(user.id),
      });
      navigate("/");
    } catch (error) {
      throw error;
    }
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
      setUser({
        ...updatedInfo,
        image: updatedInfo.image ?? getRendomAvatorUrl(user.id),
      });
    } catch (error) {
      notify("update user error", "error");
    }
  };

  const logout = async () => {
    await authControllerLogout();
    clearAccessTokenAndUser();
    setUser(null);
  };
  const updateEmail = (email: string) => {
    if (!user) {
      return;
    }
    setUser({ ...user, email });
  };

  useEffect(() => {
    getAccessTokenAndUser().then(({ user }) => {
      setUser({
        ...user,
        image: user.image ?? getRendomAvatorUrl(user.id),
      });
    });
  }, []);

  const value = useMemo(
    () =>
      ({ user, login, logout, updateBaseInfo, updateEmail }) as AuthContextType,
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
