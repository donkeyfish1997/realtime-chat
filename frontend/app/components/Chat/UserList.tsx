import { Stack, Typography, Avatar } from "@mui/material";
import { getRendomAvatorUrl } from "utils/stringToHashNumber";
import type { ChatSummaryOutputDtoOutput } from "api/models";

export default function UserList({
  users,
  onClickUser,
}: {
  users: ChatSummaryOutputDtoOutput;
  onClickUser: (user: ChatSummaryOutputDtoOutput[0]) => void;
}) {
  return (
    <Stack spacing={2} sx={{ overflowY: "auto" }}>
      {users.map((user) => (
        <Stack
          key={user.conversationId}
          direction="row"
          spacing={2}
          padding={1}
          onClick={() => onClickUser(user)}
          sx={(theme) => ({
            height: "70px",
            borderRadius: "5px",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
              cursor: "pointer",
            },
          })}
        >
          <Avatar
            src={user.partner.image ?? getRendomAvatorUrl(user.partner.id)}
            sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
          ></Avatar>
          <Stack justifyContent="center">
            <Typography alignContent={"center"}>{user.partner.name}</Typography>
            <Typography alignContent={"center"}>
              {user.lastMessage?.content}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
