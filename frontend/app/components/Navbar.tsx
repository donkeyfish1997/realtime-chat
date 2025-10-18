import { useState, type MouseEvent } from "react";
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
import ChatIcon from "@mui/icons-material/Chat";
import { useAuth } from "../context/AuthContext";

// --- 3. 登入/登出/頭像組件 (AuthStatusDisplay) ---

function AuthStatusDisplay() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // anchorEl 設置為 HTMLElement | null
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 定義事件處理器的類型
  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleGoProfile = () => {
    setAnchorEl(null);
    navigate("profile");
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
            alt={user.image ?? undefined}
            src={user.image ?? undefined}
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
          <MenuItem onClick={handleGoProfile}>個人資料</MenuItem>
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
    <Button color="inherit" onClick={() => navigate("login")}>
      登入
    </Button>
  );
}

// --- 4. 導航欄元件 (NavBar) ---

export default function NavBar() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* 應用程式標題 */}
        <Typography
          variant="h6"
          component={Link} // 使用 Link 元件
          to="/" // 導航到首頁
          sx={{
            flexGrow: 1,
            textDecoration: "none", // 移除 Link 的底線
            color: "inherit", // 繼承 AppBar 的白色字體
            cursor: "pointer", // 增加指標以強調可點擊
          }}
        >
          React Chat App
        </Typography>

        {/* 導航連結 (使用 Stack 建立間距) */}
        <Stack direction="row" spacing={2} sx={{ mr: 3 }}>
          {/* Link 元件需要從 react-router-dom 導入 */}

          <Button color="inherit" component={Link} to="/chat">
            <ChatIcon sx={{ mr: 0.5 }} fontSize="small" />
            Chat
          </Button>
        </Stack>

        {/* 登入狀態顯示與控制 */}
        <AuthStatusDisplay />
      </Toolbar>
    </AppBar>
  );
}
