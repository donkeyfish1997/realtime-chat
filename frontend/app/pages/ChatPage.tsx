import { Avatar, Divider, lighten, Stack, Typography } from "@mui/material";
import { useImmer } from "use-immer";
import UserList from "~/components/Chat/UserList";
import MessageBox from "~/components/Chat/MessageBox";
import { useEffect, useRef } from "react";

import {
  chatControllerGetChatSummaries,
  chatControllerGetHistoricalMessages,
} from "../../api/chat";
import type {
  ChatSummaryOutputDtoOutputItem,
  GetHistoricalMessagesDtoOutput,
  SearchUserQueryResDtoOutputItem,
} from "api/models";
import SearchBlock from "~/components/Chat/SearchBlock";
import {
  userControllerSearchUserById,
  userControllerSearchUsers,
} from "api/user";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";

import { createWebsocket, type Message } from "~/services/websocket";
import { useAuth } from "~/context/AuthContext";

export default function ChatPage() {
  //web socket
  const socketRef = useRef<Awaited<ReturnType<typeof createWebsocket>>>(null);
  const { user } = useAuth();
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
  const [chatUserInfos, setChatUserInfos] = useImmer<
    ChatSummaryOutputDtoOutputItem[]
  >([]);
  const [currentPartner, setCurrentPartner] = useImmer<{
    id: string;
    name: string;
    image: string;
  } | null>(null);

  const [currentChatHistory, setCurrentChatHistory] =
    useImmer<GetHistoricalMessagesDtoOutput>([]);

  const handleClickUser = async (user: ChatSummaryOutputDtoOutputItem) => {
    console.log("handleClickUser", setCurrentPartner, user.partner);
    const _partner = user.partner;
    setCurrentPartner({
      name: _partner.name,
      id: _partner.id,
      image: _partner.image ?? getRendomAvatorUrl(_partner.id),
    });
    console.log("final", currentPartner ?? "");
    const historicalMessages = await chatControllerGetHistoricalMessages(
      user.partner.id
    );
    setCurrentChatHistory(historicalMessages);
  };
  const handleSendMessage = (content: string) => {
    if (!currentPartner) {
      throw "handleSendMessage error, can not find currentUser";
    }
    socketRef.current?.emit(
      "sendPrivateMessage",
      {
        targetUserId: currentPartner.id,
        message: content,
      },
      (info) => {
        if ("errorMessage" in info) {
          throw info.errorMessage;
        } else {
          console.log("typtyptyup", typeof info.created_at);
          setCurrentChatHistory((currentChatHistory) => {
            currentChatHistory.push({
              ...info,
            });
          });
        }
      }
    );
  };

  useEffect(() => {
    chatControllerGetChatSummaries().then((result) => {
      setChatUserInfos(result);
    });
  }, []);
  function handleReceiveMessage(message: Message) {
    if (currentPartner?.id === message.sender_id) {
      setCurrentChatHistory((currentChatHistory) => {
        currentChatHistory.push(message);
      });
    }
    setChatUserInfos((chatUserInfos) => {
      const chatUserInfoIndex = chatUserInfos.findIndex(
        (chatUserInfo) => chatUserInfo.partner.id === message.sender_id
      );
      if (chatUserInfoIndex !== -1) {
        const [removedItem] = chatUserInfos.splice(chatUserInfoIndex, 1);
        chatUserInfos.push({
          ...removedItem,
          isOnline: true,
          lastMessage: {
            ...message,
            sentByMe: false,
            createdAt: message.created_at,
          },
        });
      } else {
        userControllerSearchUserById({
          userId: message.sender_id,
        }).then((user) => {
          chatUserInfos.push({
            conversationId: message.conversation_id,
            unreadCount: 1,
            partner: { ...user },
            isOnline: true,
            lastMessage: {
              ...message,
              sentByMe: false,
              createdAt: message.created_at,
            },
          });
        });
      }
    });
  } // 呼叫效果事件處理器

  useEffect(() => {
    createWebsocket().then((socket) => {
      socketRef.current = socket;
      socket.on("receive_private_message", (message) => {
        handleReceiveMessage(message);
      });
    });

    // 4. 清理：斷開連線
    return () => {
      console.log("正在斷開 Socket.IO 連線...");
      socketRef.current?.disconnect();
    };
  }, [currentPartner]);

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
        {searchUserInfo.currectUser && (
          <>
            <Stack
              direction="row"
              spacing={2}
              padding={1}
              onClick={() => setCurrentPartner(searchUserInfo.currectUser)}
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
                src={searchUserInfo.currectUser.image}
                sx={{ height: "100%", width: "auto", aspectRatio: "1 / 1" }}
              ></Avatar>

              <Typography
                alignContent={"center"}
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {searchUserInfo.currectUser.name}
              </Typography>
            </Stack>
          </>
        )}
        <Divider></Divider>
        <UserList users={chatUserInfos} onClickUser={handleClickUser} />
      </Stack>
      <MessageBox
        user={user}
        partner={currentPartner}
        messages={currentChatHistory}
        onSendMessage={handleSendMessage}
      />
    </Stack>
  );
}
