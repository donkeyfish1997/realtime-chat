import {
  chatControllerGetChatSummaries,
  chatControllerGetHistoricalMessages,
} from "api/chat";
import type {
  ChatSummaryOutputDtoOutputItem,
  GetHistoricalMessagesDtoOutputItem,
  SearchUserQueryResDtoOutputItem,
} from "api/models";
import {
  userControllerSearchUserById,
  userControllerSearchUsers,
} from "api/user";
import { useEffect, useRef, useState } from "react";
import { useImmer, useImmerReducer } from "use-immer";
import { createWebsocket } from "~/services/websocket";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";
export type ChatInfo = {
  partner: { name: string; image: string; id: string };
  unreadCount: number;
  isOnline: boolean;
  messages: GetHistoricalMessagesDtoOutputItem[];
};
type Action =
  | { type: "init"; payload: ChatSummaryOutputDtoOutputItem[] }
  | {
      type: "addExcistPartnerMessages";
      payload: {
        partnerId: string;
        messages: GetHistoricalMessagesDtoOutputItem[];
      };
    }
  | {
      type: "addNewPartnerMessages";
      payload: {
        partner: { id: string; name: string; image: string | null };
        messages: GetHistoricalMessagesDtoOutputItem[];
      };
    };
function chatInfoReducer(
  chatInfos: ChatInfo[],
  { type, payload }: Action
): ChatInfo[] {
  switch (type) {
    //more new more front
    case "init": {
      return payload.map(({ partner, unreadCount, isOnline, lastMessage }) => ({
        isOnline,
        unreadCount,
        partner: {
          ...partner,
          image: partner.image ?? getRendomAvatorUrl(partner.id),
        },
        messages: [lastMessage],
      }));
    }
    case "addExcistPartnerMessages": {
      const partnerChatInfoIndex = chatInfos.findIndex(
        (chatInfo) => chatInfo.partner.id === payload.partnerId
      );
      if (partnerChatInfoIndex === -1) {
        throw "addExcistPartnerMessage error,can not find partnerId";
      }
      const [partnerChatInfo] = chatInfos.splice(partnerChatInfoIndex, 1);
      chatInfos.unshift(partnerChatInfo);
      partnerChatInfo.messages.push(...payload.messages);
      return chatInfos;
    }
    case "addNewPartnerMessages": {
      chatInfos.unshift({
        partner: {
          ...payload.partner,
          image:
            payload.partner.image ?? getRendomAvatorUrl(payload.partner.id),
        },
        isOnline: false,
        unreadCount: 0,
        messages: payload.messages,
      });
      return chatInfos;
    }
    default: {
      throw Error("Unknown action: " + type);
    }
  }
}
export const useChatInfo = () => {
  const [currentChatUserId, setcurrentChatUserId] = useState<string | null>(
    null
  );
  const socketRef = useRef<Awaited<ReturnType<typeof createWebsocket>>>(null);

  const [chatInfos, chatInfoDipatch] = useImmerReducer(
    chatInfoReducer,
    [] as ChatInfo[]
  );
  const currentChatInfo = chatInfos.find(
    (info) => info.partner.id === currentChatUserId
  );

  const sendMessage = (partnerId: string | undefined, content: string) => {
    if (!partnerId) {
      throw "handleSendMessage error, can not find currentUser";
    }
    socketRef.current?.emit(
      "sendPrivateMessage",
      {
        targetUserId: partnerId,
        message: content,
      },
      async (info) => {
        if ("errorMessage" in info) {
          throw info.errorMessage;
        }
        if (chatInfos.find((chatInfo) => chatInfo.partner.id === partnerId)) {
          chatInfoDipatch({
            type: "addExcistPartnerMessages",
            payload: { partnerId, messages: [info] },
          });
          return;
        }
        const user = await userControllerSearchUserById({ userId: partnerId });
        chatInfoDipatch({
          type: "addNewPartnerMessages",
          payload: { partner: user, messages: [info] },
        });
      }
    );
  };
  const hanleChoseChatBox = async (userId: string) => {
    const partnerInfo = chatInfos.find(
      (chatInfo) => chatInfo.partner.id === userId
    );
    setcurrentChatUserId(userId);
    if (!partnerInfo) {
      const user = await userControllerSearchUserById({ userId });
      chatInfoDipatch({
        type: "addNewPartnerMessages",
        payload: { partner: user, messages: [] },
      });
      return;
    }
    if (partnerInfo.messages.length === 1) {
      const historicalMessages = await chatControllerGetHistoricalMessages(
        userId,
        { cursorLastTime: partnerInfo.messages[0].created_at }
      );
      historicalMessages.length &&
        chatInfoDipatch({
          type: "addExcistPartnerMessages",
          payload: { partnerId: userId, messages: historicalMessages },
        });
    }
  };

  useEffect(() => {
    chatControllerGetChatSummaries().then((result) => {
      chatInfoDipatch({ type: "init", payload: result });
    });
    createWebsocket().then((socket) => {
      socketRef.current = socket;
      socket.on("receive_private_message", (message) => {
        const partnerChatInfo = chatInfos.find(
          (chatInfo) => chatInfo.partner.id === message.sender_id
        );
        if (partnerChatInfo) {
          chatInfoDipatch({
            type: "addExcistPartnerMessages",
            payload: { partnerId: message.sender_id, messages: [message] },
          });
          return;
        }
        const user = userControllerSearchUserById({
          userId: message.sender_id,
        }).then((user) => {
          chatInfoDipatch({
            type: "addNewPartnerMessages",
            payload: { partner: user, messages: [message] },
          });
        });
      });
    });

    // 4. 清理：斷開連線
    return () => {
      console.log("正在斷開 Socket.IO 連線...");
      socketRef.current?.disconnect();
    };
  }, []);

  // about search user

  const [searchUserInfos, setSearchUserInfos] = useImmer<{
    userOptions: (SearchUserQueryResDtoOutputItem & { image: string })[];
    isLoading: boolean;
  }>({ userOptions: [], isLoading: false });
  const SearchUsers = async (query: string) => {
    setSearchUserInfos((searchUserInfos) => {
      searchUserInfos.isLoading = true;
    });
    try {
      const _userOptions = await userControllerSearchUsers({
        query: query,
      });
      const userOptions = _userOptions.map((user) => {
        return { ...user, image: user.image ?? getRendomAvatorUrl(user.id) };
      });
      setSearchUserInfos((searchUserInfo) => {
        searchUserInfo.userOptions = userOptions;
      });
    } catch (error) {
    } finally {
      setSearchUserInfos((searchUserInfos) => {
        searchUserInfos.isLoading = false;
      });
    }
  };
  // about search user end
  return {
    currentChatInfo,
    chatInfos,
    sendMessage,
    hanleChoseChatBox,
    searchUserInfos,
    SearchUsers,
  };
};
