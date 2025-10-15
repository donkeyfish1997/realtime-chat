import {
  authControllerRequestPasswordReset,
  authControllerResetPassword,
} from "api/auth";
import type { Route } from "./+types/ForgetPasswordPage";
import {
  Box,
  Button,
  Divider,
  FormControl,
  TextField,
  Typography,
  Stack,
  Link,
  FormLabel,
} from "@mui/material";
import { useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router";
import { ContentCard } from "~/components/UI";
import { useNotification } from "~/context/NotificationContext";
import { AxiosError } from "axios";

export default function ForgetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"inputEmail" | "verifyToken">(
    "inputEmail"
  );
  const email = useRef<HTMLInputElement>(null);
  const newPassword = useRef<HTMLInputElement>(null);
  const token = useRef<HTMLInputElement>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>("");
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string>("");
  const { notify } = useNotification();
  const [newPasswordErrorMessage, setnewPasswordErrorMessage] =
    useState<string>("");
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);

  const handleSearch = async () => {
    setEmailErrorMessage("");
    if (!email.current?.value)
      return setEmailErrorMessage("please enter email.");

    if (email.current.value.length < 4)
      return setEmailErrorMessage("please enter correct email.");
    try {
      await authControllerRequestPasswordReset(
        { email: email.current.value },
        { isPublic: true }
      );
      setSearchedEmail(email.current.value);
      notify("(develope) token: " + "aa112233");
      setPhase("verifyToken");
    } catch (error) {
      setEmailErrorMessage("can not find this email");
    }
  };
  const handleCancel = () => {
    navigate("/login");
  };
  const handleDidNotGetToken = () => {
    notify("還沒實作", "warning");
  };
  const handleVerifyToken = async () => {
    if (
      !(token.current?.value || searchedEmail || newPassword.current?.value)
    ) {
      setEmailErrorMessage("something error");
      setnewPasswordErrorMessage("something error");
      return;
    }

    await authControllerResetPassword(
      {
        token: (token.current as HTMLInputElement).value,
        identifier: searchedEmail as string,
        newPassword: (newPassword.current as HTMLInputElement).value,
      },
      { isPublic: true }
    )
      .then(() => {
        notify("reset password success");
        navigate("/");
      })
      .catch((e) => {
        const message =
          e instanceof AxiosError
            ? (e.response?.data.message as string)
            : "token error";

        setTokenErrorMessage(message);
        setnewPasswordErrorMessage(message);
      });
  };

  return (
    <>
      {phase === "inputEmail" ? (
        <ForgetPasswordForm
          email={email}
          emailErrorMessage={emailErrorMessage}
          onCancel={handleCancel}
          onSearch={handleSearch}
        />
      ) : (
        <VerifyTokenForm
          token={token}
          tokenErrorMessage={tokenErrorMessage}
          password={newPassword}
          passwordErrorMessage={newPasswordErrorMessage}
          onCancel={handleCancel}
          onDidNotGetToken={handleDidNotGetToken}
          onVerifyToken={handleVerifyToken}
        />
      )}
    </>
  );
}

const ForgetPasswordForm = (props: {
  email: RefObject<HTMLInputElement | null>;
  emailErrorMessage: string;
  onCancel: (...args: any) => any;
  onSearch: (...args: any) => any;
}) => {
  const { email, emailErrorMessage, onCancel, onSearch } = props;
  return (
    <ContentCard>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Forget Password
      </Typography>
      <Divider />
      <Typography variant="h6">
        Please enter your email to search for your account.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 2,
        }}
      >
        <FormControl>
          <TextField
            inputRef={email}
            error={!!emailErrorMessage}
            helperText={emailErrorMessage}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            color={emailErrorMessage ? "error" : "primary"}
          />
        </FormControl>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            // 讓按鈕靠右對齊 (類似圖片的常見彈窗佈局)
            justifyContent: "flex-end",
            // 增加一些整體邊距，模擬圖片中的卡片邊緣
            padding: 2,
            borderTop: "1px solid #eee", // 模擬上方的分隔線
          }}
        >
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={onSearch}>
            Search
          </Button>
        </Stack>
      </Box>
    </ContentCard>
  );
};
const VerifyTokenForm = (props: {
  token: RefObject<HTMLInputElement | null>;
  tokenErrorMessage: string;
  password: RefObject<HTMLInputElement | null>;
  passwordErrorMessage: string;
  onCancel: (...args: any) => any;
  onDidNotGetToken: (...args: any) => any;
  onVerifyToken: (...args: any) => any;
}) => {
  const {
    token,
    tokenErrorMessage,
    password,
    passwordErrorMessage,
    onDidNotGetToken,
    onVerifyToken,
    onCancel,
  } = props;
  return (
    <ContentCard>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Enter security code
      </Typography>
      <Divider />
      <Typography variant="h6">
        Please check your email for a message with your code.
      </Typography>

      <Box
        component="form"
        // onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 2,
        }}
      >
        <FormControl>
          <FormLabel htmlFor="token">token</FormLabel>
          <TextField
            inputRef={token}
            error={!!tokenErrorMessage}
            helperText={tokenErrorMessage}
            name="token"
            placeholder="your token"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={tokenErrorMessage ? "error" : "primary"}
          />
          <FormLabel htmlFor="newPassword">new password</FormLabel>
          <TextField
            inputRef={password}
            error={!!passwordErrorMessage}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="your token"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordErrorMessage ? "error" : "primary"}
          />
        </FormControl>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "flex-end",
            padding: 2,
            borderTop: "1px solid #eee",
          }}
        >
          <Link
            component="button"
            type="button"
            onClick={onDidNotGetToken}
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            Didn't get a code?
          </Link>
          <Button variant="outlined" sx={{ ml: "auto" }} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={onVerifyToken}>
            Countion
          </Button>
        </Stack>
      </Box>
    </ContentCard>
  );
};
