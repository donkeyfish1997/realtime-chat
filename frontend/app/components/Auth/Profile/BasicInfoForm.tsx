import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import type { LoginResponseDtoOutputUser } from "api/models";
import { useNotification } from "~/context/NotificationContext";
import { useAuth } from "~/context/AuthContext";

const BasicInfoForm = ({ user }: { user: LoginResponseDtoOutputUser }) => {
  const { notify } = useNotification();
  const auth = useAuth();
  // 1. 使用 State 管理表單輸入，從傳入的 user 屬性設定初始值
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // 2. 處理表單提交時的載入狀態 (防止重複點擊)
  const [isLoading, setIsLoading] = useState(false);

  // 3. 處理表單提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 檢查是否有實際變動
    if (name === user.name && email === user.image) {
      notify("沒有任何資料變動");
      return;
    }
    await auth.updateBaseInfo({
      name: name,
      image: email,
    });
    notify("update user success");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      // 使用 MUI 的 sx 屬性來設定樣式：flex 佈局，垂直方向，間距為 3
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar alt={user.name ?? ""} src={user.image ?? ""} />
        <p>之後要實作 換照片</p>
      </Stack>
      <TextField
        label="姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth // 佔滿可用寬度
        required
        disabled={isLoading}
      />
      {/* 電子郵件輸入框 */}
      <TextField
        label={"Email" + (user.emailVerified ? " -- not validated" : "")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        disabled={true}
      />
      {/* 儲存按鈕 */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isLoading} // 提交中時禁用按鈕
        sx={{ mt: 1, alignSelf: "flex-start" }} // 讓按鈕靠左對齊
      >
        {isLoading ? (
          // 提交中時顯示載入圈
          <CircularProgress size={24} color="inherit" />
        ) : (
          "save"
        )}
      </Button>
    </Box>
  );
};

export default BasicInfoForm;
