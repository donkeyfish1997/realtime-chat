import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAuth } from "~/context/AuthContext";
import {
  authControllerRequestPasswordReset,
  authControllerResetPassword,
} from "api/auth";
import { useNotification } from "~/context/NotificationContext";

// 定義流程步驟
enum STEPS {
  REQUEST_TOKEN = 1,
  RESET_PASSWORD = 2,
  SUCCESS = 3,
}

const PasswordChangeForm = () => {
  // 追蹤當前的步驟：1 (發送 Email) 或 2 (輸入 Token/新密碼)
  const [step, setStep] = useState<STEPS>(STEPS.REQUEST_TOKEN);

  // 狀態管理：Reset Password 步驟
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { user } = useAuth();
  const { notify } = useNotification();

  const handleSendResetPassword = async () => {
    console.log(123);
    try {
      await authControllerRequestPasswordReset({ email: user?.email ?? "" });
      notify("(dev) code: aa112233");
      setStep(STEPS.RESET_PASSWORD);
    } catch (error) {
      notify("can't reset password, please contact us", "error");
    }
  };
  const handleSetNewPassword = async () => {
    if (!token || !newPassword) {
      notify("token and password not null", "error");
      return;
    }
    try {
      await authControllerResetPassword({
        identifier: user?.email ?? "",
        token,
        newPassword,
      });
      notify("reset password success.");
      setStep(STEPS.SUCCESS);
    } catch (error) {
      notify("token error, maybe~~", "error");
    }
  };

  // --- 渲染成功頁面 ---
  if (step === STEPS.SUCCESS) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          ✅ 密碼重設成功！
        </Typography>
        <Typography variant="body1">
          您現在可以使用新密碼登入帳號了。
        </Typography>
        <Button
          variant="contained"
          onClick={() => setStep(STEPS.REQUEST_TOKEN)}
          sx={{ mt: 3 }}
        >
          返回起始頁
        </Button>
      </Box>
    );
  }

  // --- 渲染表單主要內容 ---
  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {step === STEPS.REQUEST_TOKEN && (
        <>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSendResetPassword}
            sx={{ mt: 1, alignSelf: "flex-start" }}
          >
            reset password
          </Button>
        </>
      )}

      {/* --- 步驟 2: 輸入 Token & 新密碼 --- */}
      {step === STEPS.RESET_PASSWORD && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            請輸入您從郵件中獲得的 Code，並設定您的新密碼。
          </Typography>
          <TextField
            label="Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="新密碼"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="button"
            variant="contained"
            sx={{ mt: 1, alignSelf: "flex-start" }}
            onClick={handleSetNewPassword}
          >
            set new password
          </Button>
          <Button
            variant="text"
            color="info"
            onClick={() => setStep(STEPS.REQUEST_TOKEN)}
          >
            重新發送 Email
          </Button>
        </>
      )}
    </Box>
  );
};

export default PasswordChangeForm;
