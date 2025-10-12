import { Stack, Typography, Avatar } from "@mui/material";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";
import type { ChatSummaryOutputDtoOutput } from "api/models";
import type { ChatInfo } from "./useChatInfo";

export default function UserList({
  users,
  onClickUser,
}: {
  users: ChatInfo[];
  onClickUser: (userId: string) => void;
}) {
  return (
    <Stack spacing={2} sx={{ overflowY: "auto" }}>
      {users.map((user) => (
        <Stack
          key={user.partner.id}
          direction="row"
          spacing={2}
          padding={1}
          onClick={() => onClickUser(user.partner.id)}
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
              {user.messages.length === 0
                ? ""
                : user.messages[user.messages.length - 1].content}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
