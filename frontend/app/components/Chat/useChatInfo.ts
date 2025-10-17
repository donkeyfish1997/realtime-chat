import {
  chatControllerGetChatSummaries,
  chatControllerGetHistoricalMessages,
  chatControllerSendPrivateMessage,
  chatControllerMarkConversationAsRead,
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
import { useAuth } from "~/context/AuthContext";
import { createWebsocket } from "~/services/websocket";
import { getRendomAvatorUrl } from "~/utils/getRendomAvatorUrl";
export type ChatInfo = {
  partner: { name: string; image: string; id: string };
  unreadCount: number;
  isOnline: boolean;
  messages: GetHistoricalMessagesDtoOutputItem[]; //新的在前
};
type Action =
  | { type: "init"; payload: ChatSummaryOutputDtoOutputItem[] }
  | {
      type: "addExcistPartnerMessages";
      payload: {
        partnerId: string;
        messages: GetHistoricalMessagesDtoOutputItem[];
        type: "new" | "history";
      };
    }
  | {
      type: "addNewPartnerMessages";
      payload: {
        partner: { id: string; name: string; image: string | null };
        messages: GetHistoricalMessagesDtoOutputItem[];
      };
    }
  | {
      type: "markMessagesAsRead";
      payload: {
        type: "iReaded" | "userReaded";
        partnerId: string;
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

      if (payload.type === "history") {
        chatInfos[partnerChatInfoIndex].messages.push(...payload.messages);
      } else {
        const [partnerChatInfo] = chatInfos.splice(partnerChatInfoIndex, 1);
        chatInfos.unshift(partnerChatInfo);
        partnerChatInfo.messages.unshift(...payload.messages);
        const newNotRead = payload.messages.filter(
          (message) =>
            message.status !== "READ" && message.sender_id === payload.partnerId
        ).length;
        partnerChatInfo.unreadCount += newNotRead;
      }
      return chatInfos;
    }
    case "addNewPartnerMessages": {
      const newNotRead = payload.messages.filter(
        (message) =>
          message.status !== "READ" && message.sender_id === payload.partner.id
      ).length;
      chatInfos.unshift({
        partner: {
          ...payload.partner,
          image:
            payload.partner.image ?? getRendomAvatorUrl(payload.partner.id),
        },
        isOnline: false,
        unreadCount: newNotRead,
        messages: payload.messages,
      });
      return chatInfos;
    }
    case "markMessagesAsRead": {
      const partnerInfo = chatInfos.find(
        (info) => info.partner.id === payload.partnerId
      );
      if (!partnerInfo) {
        console.log("markMessagesAsRead error, can not find partnerInfo");
        return chatInfos;
      }
      if (payload.type === "iReaded") partnerInfo.unreadCount = 0;

      payload.type === "iReaded" &&
        (partnerInfo?.messages ?? []).forEach((m) => {
          if (m.sender_id === payload.partnerId) {
            m.status = "READ";
          }
        });
      payload.type === "userReaded" &&
        (partnerInfo?.messages ?? []).forEach((m) => {
          if (m.sender_id !== payload.partnerId) {
            m.status = "READ";
          }
        });
      return chatInfos;
    }
    default: {
      throw Error("Unknown action: " + type);
    }
  }
}
export const useChatInfo = () => {
  const { user: MyInfo } = useAuth();
  const [currentChatUserId, setcurrentChatUserId] = useState<string | null>(
    null
  );
  const currentChatUserIdRef = useRef(currentChatUserId);
  useEffect(() => {
    currentChatUserIdRef.current = currentChatUserId;
  }, [currentChatUserId]);
  const socketRef = useRef<Awaited<ReturnType<typeof createWebsocket>>>(null);

  const [chatInfos, chatInfoDipatch] = useImmerReducer(
    chatInfoReducer,
    [] as ChatInfo[]
  );
  const chatInfosRef = useRef(chatInfos);
  useEffect(() => {
    chatInfosRef.current = chatInfos;
  }, [chatInfos]);
  const currentChatInfo = chatInfos.find(
    (info) => info.partner.id === currentChatUserId
  );

  const sendMessage = (partnerId: string | undefined, content: string) => {
    if (!partnerId) {
      throw "handleSendMessage error, can not find currentUser";
    }
    chatControllerSendPrivateMessage(partnerId, { message: content }).then(
      async (info) => {
        if (chatInfos.find((chatInfo) => chatInfo.partner.id === partnerId)) {
          chatInfoDipatch({
            type: "addExcistPartnerMessages",
            payload: { partnerId, messages: [info], type: "new" },
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

    const historicalMessages = await chatControllerGetHistoricalMessages(
      userId,
      {
        cursorLastTime:
          partnerInfo.messages[partnerInfo.messages.length - 1].created_at,
      }
    );
    historicalMessages.length &&
      chatInfoDipatch({
        type: "addExcistPartnerMessages",
        payload: {
          partnerId: userId,
          messages: historicalMessages,
          type: "history",
        },
      });
    if (partnerInfo.unreadCount) {
      try {
        await chatControllerMarkConversationAsRead(partnerInfo.partner.id);
        chatInfoDipatch({
          type: "markMessagesAsRead",
          payload: { partnerId: partnerInfo.partner.id, type: "iReaded" },
        });
      } catch (error) {
        console.log("chatControllerMarkConversationAsRead error", error);
      }
    }
  };

  useEffect(() => {
    chatControllerGetChatSummaries().then((result) => {
      chatInfoDipatch({ type: "init", payload: result });
    });
    createWebsocket().then((socket) => {
      socketRef.current = socket;
      socket.on("receive_private_message", (message) => {
        const partnerChatInfo = chatInfosRef.current.find(
          (chatInfo) => chatInfo.partner.id === message.sender_id
        );
        if (!partnerChatInfo) {
          userControllerSearchUserById({
            userId: message.sender_id,
          }).then((user) => {
            chatInfoDipatch({
              type: "addNewPartnerMessages",
              payload: { partner: user, messages: [message] },
            });
          });

          return;
        }
        chatInfoDipatch({
          type: "addExcistPartnerMessages",
          payload: {
            partnerId: message.sender_id,
            messages: [message],
            type: "new",
          },
        });
        if (currentChatUserIdRef.current === message.sender_id) {
          chatControllerMarkConversationAsRead(message.sender_id).then(() => {
            chatInfoDipatch({
              type: "markMessagesAsRead",
              payload: { partnerId: message.sender_id, type: "iReaded" },
            });
          });
        }
      });
      socket.on("user_readed", ({ readerId }) => {
        chatInfoDipatch({
          type: "markMessagesAsRead",
          payload: { partnerId: readerId, type: "userReaded" },
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
      const userOptions = _userOptions
        .map((user) => {
          return { ...user, image: user.image ?? getRendomAvatorUrl(user.id) };
        })
        .filter((user) => user.id !== MyInfo?.id);
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
