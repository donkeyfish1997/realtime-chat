import { Avatar, Box, lighten, Stack, Typography } from "@mui/material";
import { getRendomAvatorUrl } from "utils/stringToHashNumber";
import type { Message } from "~/pages/type";

export default function MessageBubble({
  messageInfo,
}: {
  messageInfo: Message;
}) {
  return (
    <>
      <Stack
        direction={"row"}
        alignItems={"end"}
        marginBottom={"3px"}
        spacing={1}
        maxWidth={"80%"}
      >
        <Avatar
          src={messageInfo.img ?? getRendomAvatorUrl(messageInfo.email)}
          // sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
        ></Avatar>
        <Box
          padding={1}
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.primary.light, 0.6),
            borderRadius: "5px",
          })}
        >
          <Typography alignContent={"center"}>{messageInfo.message}</Typography>
        </Box>
      </Stack>
    </>
  );
}
