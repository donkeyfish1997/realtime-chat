import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import { getRendomAvatorUrl } from "utils/stringToHashNumber";
type User = {
  id: string;
  name?: string;
  email: string;
  img?: string;
  lastMessage?: string;
};
export default function UserList({ users }: { users: User[] }) {
  return (
    <Stack spacing={2} sx={{ overflowY: "auto" }}>
      {users.map((user) => (
        <Stack
          key={user.id}
          direction="row"
          spacing={2}
          padding={1}
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
            src={user.img ?? getRendomAvatorUrl(user.email)}
            sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
          ></Avatar>
          <Stack justifyContent="center">
            <Typography alignContent={"center"}>{user.email}</Typography>
            <Typography alignContent={"center"}>{user.lastMessage}</Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
