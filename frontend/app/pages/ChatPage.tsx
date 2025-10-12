import { Avatar, Divider, lighten, Stack, Typography } from "@mui/material";
import UserList from "~/components/Chat/UserList";
import MessageBox from "~/components/Chat/MessageBox";
import { useChatInfo } from "~/components/Chat/useChatInfo";
import SearchBlock from "~/components/Chat/SearchBlock";
import { useAuth } from "~/context/AuthContext";

export default function ChatPage() {
  const {
    currentChatInfo,
    chatInfos,
    sendMessage,
    hanleChoseChatBox,
    searchUserInfos,
    SearchUsers,
  } = useChatInfo();
  const { user } = useAuth();
  return (
    <Stack
      direction="row"
      sx={{
        margin: [-2, -4],
        height: ["calc(100dvh - 56px)", "calc(100dvh - 64px)"],

        width: [`calc(100% + ${2 * 2} * 8px)`, `calc(100% + ${4 * 2} * 8px)`],
        overflow: "hidden", // 確保內容不會溢出
      }}
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
        <SearchBlock
          currentOption={currentChatInfo?.partner ?? null}
          options={searchUserInfos.userOptions}
          isLoading={searchUserInfos.isLoading}
          onSectedUser={hanleChoseChatBox}
          onSearchUsers={SearchUsers}
        />
        <Divider></Divider>
        <UserList users={chatInfos} onClickUser={hanleChoseChatBox} />
      </Stack>
      <MessageBox
        user={user}
        partner={currentChatInfo?.partner ?? null}
        messages={currentChatInfo?.messages ?? []}
        onSendMessage={(content: string) => {
          sendMessage(currentChatInfo?.partner.id, content);
        }}
      />
    </Stack>
  );
}
