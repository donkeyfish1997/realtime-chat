import {
  Avatar,
  Button,
  Divider,
  lighten,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getRendomAvatorUrl } from "utils/stringToHashNumber";
import type { Message } from "~/pages/type";
import MessageBubble from "./MessageBubble";
type User = {
  id: string;
  name?: string;
  email: string;
  img?: string;
  lastMessage?: string;
};
export default function MessageBox({
  user,
  messages,
}: {
  user: User | null;
  messages: Message[];
}) {
  return (
    <>
      <Stack
        spacing={1}
        sx={(theme) => ({
          margin: 2,
          padding: 2,
          width: "100%",
          backgroundColor: lighten(theme.palette.primary.light, 0.9),
          borderRadius: "5px",
        })}
      >
        {user && (
          <>
            <Stack
              direction="row"
              spacing={2}
              // padding={1}
              sx={(theme) => ({
                height: "70px",
                borderRadius: "5px",
                "&:hover": { backgroundColor: theme.palette.action.hover },
              })}
            >
              <Avatar
                src={user.img ?? getRendomAvatorUrl(user.email)}
                sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
              ></Avatar>
              <Typography alignContent={"center"}>{user.email}</Typography>
            </Stack>
            <Divider></Divider>
            <Stack
              sx={{
                flexGrow: 1, // 🚨 關鍵：佔據所有剩餘高度
                padding: 0,
                overflowY: "auto",
              }}
            >
              {messages.map((message) => (
                <MessageBubble messageInfo={message} />
              ))}
            </Stack>

            <Stack direction="row" alignItems={"end"} spacing={2}>
              <TextField
                variant="outlined"
                placeholder="message..."
                size="small"
                fullWidth
                multiline
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                  },
                }}
              />
              <Button variant="contained">enter</Button>
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
}
