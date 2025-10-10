import {
  Avatar,
  Button,
  Divider,
  lighten,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";
import MessageBubble from "./MessageBubble";
import type {
  ChatSummaryOutputDtoOutput,
  GetHistoricalMessagesDtoOutput,
} from "api/models";
import { useEffect, useRef, useState } from "react";
export default function MessageBox({
  user,
  partner,
  messages,
  onSendMessage,
}: {
  user: { id: string; image: string } | null;
  partner: { id: string; image: string; name: string } | null;
  messages: GetHistoricalMessagesDtoOutput;
  onSendMessage: (content: string) => void;
}) {
  const [content, setContent] = useState("");
  // 1. 創建 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. 監聽 messages 變化並滾動
  useEffect(() => {
    // 檢查 Ref 是否存在，然後滾動
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth", // 可選：平滑滾動
    });

    // 確保當 messages 陣列更新時觸發
  }, [messages]);
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
        {partner && (
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
                src={partner.image}
                sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
              ></Avatar>
              <Typography alignContent={"center"}>{partner.name}</Typography>
            </Stack>
            <Divider></Divider>
            <Stack
              sx={{
                flexGrow: 1, // 🚨 關鍵：佔據所有剩餘高度
                padding: 0,
                overflowY: "auto",
              }}
            >
              {messages.map((message) => {
                return (
                  <MessageBubble
                    key={message.id}
                    isReDireact={message.sender_id === user?.id ? true : false}
                    userImg={
                      message.sender_id === user?.id
                        ? user.image
                        : partner.image
                    }
                    messageInfo={message}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </Stack>

            <Stack direction="row" alignItems={"end"} spacing={2}>
              <TextField
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                placeholder="message..."
                size="small"
                fullWidth
                multiline
                onKeyDown={(e) => {
                  if (!content && e.key === "Enter") {
                    e.preventDefault();
                  } else if (content && e.key === "Enter" && !e.shiftKey) {
                    onSendMessage(content);
                    e.preventDefault();
                    setContent("");
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={(e) => {
                  if (content) {
                    onSendMessage(content);
                    e.preventDefault();
                    setContent("");
                  }
                }}
              >
                enter
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
}
