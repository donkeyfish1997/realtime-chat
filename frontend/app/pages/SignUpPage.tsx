import type { Route } from "./+types/SignUpPage";
import { TextField, Box, Button, FormLabel, FormControl } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { ContentCard } from "../components/UI";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { authControllerRegister } from "api/auth";

export default function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const name = useRef<HTMLInputElement>(null);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const email = useRef<HTMLInputElement>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const password = useRef<HTMLInputElement>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const validateInputs = async () => {
    let isValid = true;
    if (!(name.current && name.current?.value.length > 3)) {
      setNameErrorMessage("name must more than 3 letter");
      isValid = false;
    } else {
      setNameErrorMessage("");
    }
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
    if (!isValid) return;
    try {
      const user = await authControllerRegister({
        name: name.current?.value as string,
        email: email.current?.value as string,
        password: password.current?.value as string,
      });
      await auth.login(
        email.current?.value as string,
        password.current?.value as string
      );
      navigate("/");
    } catch (e) {
      const message = e instanceof Error ? e.message : "some error";
      setEmailErrorMessage(message);
      setPasswordErrorMessage(message);
      return;
    }
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
          Sign up
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
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextField
              inputRef={name}
              error={!!nameErrorMessage}
              helperText={nameErrorMessage}
              slotProps={{ htmlInput: { onKeyDown: handleEnter } }}
              id="name"
              type="text"
              name="name"
              placeholder="your name"
              autoComplete="name"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={nameErrorMessage ? "error" : "primary"}
            />
          </FormControl>
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
            Sign up
          </Button>
        </Box>
      </ContentCard>
    </>
  );
}
