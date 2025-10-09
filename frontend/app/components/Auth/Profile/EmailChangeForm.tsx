import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAuth } from "~/context/AuthContext";

import { useNotification } from "~/context/NotificationContext";
import {
  authControllerConfirmChangeEmail,
  authControllerRequestChangeEmail,
} from "api/auth";

// 定義流程步驟
enum STEPS {
  REQUEST_TOKEN = 1,
  RESET_EAMIL = 2,
  SUCCESS = 3,
}

const EmailChangeForm = () => {
  const [step, setStep] = useState<STEPS>(STEPS.REQUEST_TOKEN);
  const [token, setToken] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const { user, updateEmail } = useAuth();
  const { notify } = useNotification();

  const handleSendResetEmail = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      await authControllerRequestChangeEmail({ newEmail });
      notify("(dev) code: aa112233");
      setStep(STEPS.RESET_EAMIL);
    } catch (error) {
      notify("can't reset email, please contact us", "error");
    }
  };
  const handleSetNewEmail = async () => {
    if (!token) {
      notify("please enter token", "error");
      return;
    }
    try {
      await authControllerConfirmChangeEmail({ newEmail, token });

      notify("reset email success.");
      updateEmail(newEmail);
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
          ✅ reset email success;
        </Typography>
        <Typography variant="body1">您現在可以使用登入帳號了。</Typography>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {step === STEPS.REQUEST_TOKEN && (
        <>
          <TextField
            label="新Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSendResetEmail}
            sx={{ mt: 1, alignSelf: "flex-start" }}
          >
            reset email
          </Button>
        </>
      )}

      {/* --- 步驟 2: 輸入 Token & 新Email --- */}
      {step === STEPS.RESET_EAMIL && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            enter code from your new email to comfirm.
          </Typography>
          <TextField
            label="Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="button"
            variant="contained"
            sx={{ mt: 1, alignSelf: "flex-start" }}
            onClick={handleSetNewEmail}
          >
            set new email
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

export default EmailChangeForm;
