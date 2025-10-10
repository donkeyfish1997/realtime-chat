import { getAccessTokenAndUser } from "api/custom-instance";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "~/type/socket.types";
export type { Message } from "~/type/socket.types";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export async function createWebsocket(): Promise<ChatSocket> {
  const { accessToken } = await getAccessTokenAndUser();
  if (!accessToken) throw new Error("accessToken is null");
  const socket = io({
    query: { token: accessToken },
    timeout: 3000,
    reconnection: false,
  }) as ChatSocket;
  return socket;
}
