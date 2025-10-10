import { Avatar, Box, lighten, Stack, Typography } from "@mui/material";
import type { GetHistoricalMessagesDtoOutput } from "api/models";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";

export default function MessageBubble({
  messageInfo,
  userImg,
  isReDireact = false,
}: {
  messageInfo: GetHistoricalMessagesDtoOutput[0];
  userImg: string;
  isReDireact?: boolean;
}) {
  return (
    <>
      <Stack
        direction={isReDireact ? "row-reverse" : "row"}
        alignItems={"end"}
        alignSelf={isReDireact ? "end" : "start"}
        marginBottom={"3px"}
        spacing={1}
        maxWidth={"80%"}
      >
        <Avatar
          src={userImg}
          // sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
        ></Avatar>
        <Box
          padding={1}
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.primary.light, 0.6),
            borderRadius: "5px",
          })}
        >
          <Typography alignContent={"center"}>{messageInfo.content}</Typography>
        </Box>
      </Stack>
    </>
  );
}
