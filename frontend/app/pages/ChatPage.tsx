import { Divider, lighten, Stack } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useImmer } from "use-immer";
import UserList from "~/components/Chat/UserList";
import MessageBox from "~/components/Chat/MessageBox";
import { useEffect } from "react";

import {
  chatControllerGetChatSummaries,
  chatControllerGetHistoricalMessages,
} from "../../api/chat";
import type {
  ChatSummaryOutputDtoOutput,
  GetHistoricalMessagesDtoOutput,
  SearchUserQueryResDtoOutputItem,
} from "api/models";
import SearchBlock from "~/components/Chat/SearchBlock";
import { userControllerSearchUsers } from "api/user";
import { getRendomAvatorUrl } from "utils/stringToHashNumber";

export default function ChatPage() {
  // user search
  const [searchUserInfo, setSearchUserInfo] = useImmer<{
    userOptions: (SearchUserQueryResDtoOutputItem & { image: string })[];
    currectUser: (SearchUserQueryResDtoOutputItem & { image: string }) | null;
    isLoading: boolean;
    currentText: string;
  }>({ currentText: "", userOptions: [], currectUser: null, isLoading: false });
  const handleSearchUsers = async () => {
    setSearchUserInfo((searchUserInfo) => {
      searchUserInfo.isLoading = true;
    });
    try {
      const _userOptions = await userControllerSearchUsers({
        query: searchUserInfo.currentText,
      });
      const userOptions = _userOptions.map((user) => {
        return { ...user, image: user.image ?? getRendomAvatorUrl(user.id) };
      });
      setSearchUserInfo((searchUserInfo) => {
        searchUserInfo.userOptions = userOptions;
      });

      console.log("userOptions", searchUserInfo);
    } catch (error) {
    } finally {
      setSearchUserInfo((searchUserInfo) => {
        searchUserInfo.isLoading = false;
      });
    }
  };
  const handleSectedUser = async (
    e: any,
    currectUser: (SearchUserQueryResDtoOutputItem & { image: string }) | null
  ) => {
    setSearchUserInfo((searchUserInfo) => {
      searchUserInfo.currectUser = currectUser;
    });
  };
  const handleChangeSearchUserText = (e: any, currentText: string) => {
    setSearchUserInfo((searchUserInfo) => {
      searchUserInfo.currentText = currentText;
    });
  };
  // chat
  const [chatUserInfos, setChatUserInfos] =
    useImmer<ChatSummaryOutputDtoOutput>([]);
  const [currentUser, setCurrentUser] = useImmer<
    ChatSummaryOutputDtoOutput[0] | null
  >(null);
  const [currentChatHistory, setCurrentChatHistory] =
    useImmer<GetHistoricalMessagesDtoOutput>([]);

  const handleClickUser = async (user: ChatSummaryOutputDtoOutput[0]) => {
    setCurrentUser(user);
    const historicalMessages = await chatControllerGetHistoricalMessages(
      user.partner.id
    );
    setCurrentChatHistory(historicalMessages);
  };

  useEffect(() => {
    chatControllerGetChatSummaries().then((result) => {
      setChatUserInfos(result);
    });
  }, []);
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
        <SearchBlock
          currentOption={searchUserInfo.currectUser}
          options={searchUserInfo.userOptions}
          isLoading={searchUserInfo.isLoading}
          onSectedUser={handleSectedUser}
          onSearchUsers={handleSearchUsers}
          onChangValue={handleChangeSearchUserText}
        />
        <Divider></Divider>
        <UserList users={chatUserInfos} onClickUser={handleClickUser} />
      </Stack>
      <MessageBox userInfo={currentUser} messages={currentChatHistory} />
    </Stack>
  );
}
