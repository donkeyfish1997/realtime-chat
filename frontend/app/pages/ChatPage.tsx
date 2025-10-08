import {
  Box,
  Divider,
  InputAdornment,
  lighten,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useImmer } from "use-immer";
import UserList from "~/components/Chat/UserList";
import MessageBox from "~/components/Chat/MessageBox";
import type { Message, User } from "./type";

export default function ChatPage() {
  const [users, setUsers] = useImmer<User[]>([
    { id: "0", email: "David1@example.com", lastMessage: "last Message" },
    { id: "1", email: "David2@example.com", lastMessage: "last Message" },
    { id: "2", email: "David3@example.com", lastMessage: "last Message" },
    { id: "3", email: "David4@example.com", lastMessage: "last Message" },
  ]);
  const [currentUser, setCurrentUser] = useImmer<User | null>(users[0]);
  const [currentChatHistory, setCurrentChatHistory] = useImmer<Message[]>([
    {
      email: "name1",
      message:
        "messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 messagess1 1 1 ",
    },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
    { email: "name1", message: "messagess1 1 1 " },
  ]);
  return (
    <Stack
      direction="row"
      sx={(theme) => ({
        margin: [-2, -4],
        height: ["calc(100dvh - 56px)", "calc(100dvh - 64px)"],

        width: [`calc(100% + ${2 * 2} * 8px)`, `calc(100% + ${4 * 2} * 8px)`],
        overflow: "hidden", // 確保內容不會溢出
      })}
    >
      <Stack
        spacing={2}
        sx={(theme) => ({
          padding: 2,
          width: "30%",
          minWidth: "300px",
          height: "100%",
          backgroundColor: lighten(theme.palette.primary.light, 0.9),
        })}
      >
        <Typography variant="h5">Chat</Typography>
        <TextField
          variant="outlined"
          placeholder="search..."
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {/* 放置你的搜尋圖標 */}
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Divider></Divider>
        <UserList users={users} />
      </Stack>
      <MessageBox user={currentUser} messages={currentChatHistory} />
    </Stack>
  );
}
