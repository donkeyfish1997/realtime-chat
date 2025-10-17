import {
  Avatar,
  Box,
  Button,
  Divider,
  lighten,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MessageBubble from "./MessageBubble";
import type { GetHistoricalMessagesDtoOutput } from "api/models";
import { useEffect, useRef } from "react";
import { markDateDividers } from "./utils/markDateDividers";
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
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  // 1. 創建 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const partnerChangedRef = useRef(false);
  useEffect(() => {
    partnerChangedRef.current = true;
    messagesEndRef.current?.scrollIntoView({
      behavior: "instant",
    });
  }, [partner]);
  useEffect(() => {
    if (partnerChangedRef.current === true) {
      partnerChangedRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
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
              })}
            >
              <Avatar
                src={partner.image}
                sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
              ></Avatar>
              <Typography alignContent={"center"} variant="h6">
                {partner.name}
              </Typography>
            </Stack>
            <Divider></Divider>
            <Stack
              sx={{
                flexGrow: 1, // 🚨 關鍵：佔據所有剩餘高度
                padding: 0,
                overflowY: "auto",
                // --- 隱藏滾輪的樣式 ---
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {markDateDividers([...messages].reverse(), new Date()).map(
                (message) => {
                  return (
                    <Box key={message.id}>
                      {message.isDateDivider && (
                        <Box sx={{ textAlign: "center", my: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {message.dateLabel}
                          </Typography>
                        </Box>
                      )}
                      <MessageBubble
                        isReDireact={
                          message.sender_id === user?.id ? true : false
                        }
                        userImg={
                          message.sender_id === user?.id
                            ? user.image
                            : partner.image
                        }
                        messageInfo={message}
                        showTime={message.shouldShowTime}
                      />
                    </Box>
                  );
                }
              )}
              <div ref={messagesEndRef} />
            </Stack>

            <Stack direction="row" alignItems={"end"} spacing={2}>
              <TextField
                inputRef={contentRef}
                variant="outlined"
                placeholder="message..."
                size="small"
                fullWidth
                multiline
                onKeyDown={(e) => {
                  if (!contentRef.current && e.key === "Enter") {
                    e.preventDefault();
                  } else if (
                    contentRef.current &&
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    onSendMessage(contentRef.current.value);
                    e.preventDefault();
                    contentRef.current.value = "";
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
                  if (contentRef.current?.value) {
                    onSendMessage(contentRef.current?.value);
                    e.preventDefault();
                    contentRef.current.value = "";
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
