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
import MessageBubble from "./MessageBubble";
import type {
  ChatSummaryOutputDtoOutput,
  GetHistoricalMessagesDtoOutput,
} from "api/models";
export default function MessageBox({
  userInfo,
  messages,
}: {
  userInfo: ChatSummaryOutputDtoOutput[0] | null;
  messages: GetHistoricalMessagesDtoOutput;
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
        {userInfo && (
          <>
            <Stack
              direction="row"
              spacing={2}
              sx={(theme) => ({
                height: "70px",
                borderRadius: "5px",
                "&:hover": { backgroundColor: theme.palette.action.hover },
              })}
            >
              <Avatar
                src={
                  userInfo.partner.image ??
                  getRendomAvatorUrl(userInfo.partner.id)
                }
                sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
              ></Avatar>
              <Typography alignContent={"center"}>
                {userInfo.partner.name}
              </Typography>
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
                <MessageBubble
                  userImg={
                    userInfo.partner.image ??
                    getRendomAvatorUrl(userInfo.partner.id)
                  }
                  messageInfo={message}
                />
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
