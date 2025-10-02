import React, { useState, createContext, useContext, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
// 確保 Link 可以在這裡被識別為元件
import { Link, useNavigate } from "react-router";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";

// --- 1. 類型定義 (Type Definitions) ---

interface User {
  email: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

// 使用 AuthContextType 定義 Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// useAuth Hook
const useAuth = () => useContext(AuthContext);

// AuthProvider 元件
function AuthProvider({ children }: { children: React.ReactNode }) {
  // 初始狀態為 null (未登入)，或設定為 initialUser 來測試登入狀態
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    // 模擬登入成功後設定使用者資訊
    setUser({
      email: "user@example.com",
      avatarUrl: "https://i.pravatar.cc/300?img=68",
    });
  };

  const logout = () => {
    setUser(null); // 清除使用者資訊
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- 3. 登入/登出/頭像組件 (AuthStatusDisplay) ---

function AuthStatusDisplay() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // anchorEl 設置為 HTMLElement | null
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 定義事件處理器的類型
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate("/"); // 登出後導航到首頁
  };

  if (user) {
    // 顯示 Email 和 Avatar
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="body2"
          sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
        >
          {user.email}
        </Typography>
        <IconButton onClick={handleMenu} color="inherit" edge="end">
          <Avatar
            alt={user.email}
            src={user.avatarUrl}
            sx={{ width: 32, height: 32 }}
          />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>個人資料</MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
            登出
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // 顯示登入按鈕
  return (
    <Button color="inherit" onClick={login}>
      登入
    </Button>
  );
}
