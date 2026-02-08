import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3100";

export function createSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const socket = io(`${SOCKET_URL}/chat`, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
  });

  return socket;
}
