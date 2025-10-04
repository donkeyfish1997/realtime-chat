import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { ContentCard } from "../UI";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

export default function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const email = useRef<HTMLInputElement>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const password = useRef<HTMLInputElement>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const validateInputs = async () => {
    let isValid = true;
    if (!email.current?.value || !/\S+@\S+\.\S+/.test(email.current?.value)) {
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailErrorMessage("");
    }

    if (!password.current || password.current.value.length < 3) {
      setPasswordErrorMessage("Password must be at least 3 characters long.");
      isValid = false;
    } else {
      setPasswordErrorMessage("");
    }
    const user =
      isValid &&
      (await auth
        .login(
          email.current?.value as string,
          password.current?.value as string
        )
        .catch((e) => {
          setEmailErrorMessage("email or password error");
          setPasswordErrorMessage("email or password error");
          return;
        }));
  };
  const handleEnter = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      validateInputs();
    }
  };

  return (
    <>
      <ContentCard variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Sign in
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              inputRef={email}
              error={!!emailErrorMessage}
              helperText={emailErrorMessage}
              slotProps={{ htmlInput: { onKeyDown: handleEnter } }}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailErrorMessage ? "error" : "primary"}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              inputRef={password}
              error={!!passwordErrorMessage}
              helperText={passwordErrorMessage}
              slotProps={{ htmlInput: { onKeyDown: handleEnter } }}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordErrorMessage ? "error" : "primary"}
            />
          </FormControl>
          <Button
            type="button"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Sign in
          </Button>
          <Link
            component="button"
            type="button"
            onClick={() => {
              navigate("/forget-password");
            }}
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            Forgot your password?
          </Link>
        </Box>
        <Divider>or</Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/material-ui/getting-started/templates/sign-in/"
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </ContentCard>
    </>
  );
}
