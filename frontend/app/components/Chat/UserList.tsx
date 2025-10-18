import { Stack, Typography, Avatar, Badge } from "@mui/material";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";
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
          <Stack flexGrow={1} minWidth="0">
            <Typography
              alignContent={"center"}
              overflow="hidden"
              textOverflow={"ellipsis"}
              variant="h6"
            >
              {user.partner.name}
            </Typography>
            <Typography
              width={"100%"}
              alignContent={"center"}
              overflow="hidden"
              textOverflow={"ellipsis"}
              color="textSecondary"
              whiteSpace={"nowrap"}
            >
              {user.messages.length === 0 ? "" : user.messages[0].content}
            </Typography>
          </Stack>
          {
            <Badge
              color="success"
              badgeContent={user.unreadCount}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              sx={{
                "& .MuiBadge-badge": {
                  right: 5,
                  bottom: 20,
                },
              }}
            ></Badge>
          }
        </Stack>
      ))}
    </Stack>
  );
}
