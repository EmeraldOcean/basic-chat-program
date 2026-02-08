"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  userId?: string;
  userSeqId?: number;
  userName?: string;
}

export default function ChatPage() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // WebSocket 연결
  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = createSocket();
    if (!newSocket) {
      return;
    }

    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("message", (data: string | { content: string; userId: string; userSeqId: number; userName: string }) => {
      // 백엔드에서 객체로 보내는 경우와 문자열로 보내는 경우 모두 처리
      const messageData = typeof data === "string" 
        ? { content: data, userId: undefined, userSeqId: undefined, userName: undefined }
        : data;
      
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          content: messageData.content,
          timestamp: new Date(),
          userId: messageData.userId,
          userSeqId: messageData.userSeqId,
          userName: messageData.userName,
        },
      ]);
    });

    newSocket.on("connect_error", () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socket || !connected) return;

    socket.emit("message", text);
    setInput("");
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-100 dark:bg-zinc-900">
      <header className="shrink-0 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              채팅
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {connected ? "연결됨" : "연결 끊김"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user?.name} ({user?.userId})
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              메시지를 입력하여 대화를 시작하세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isMyMessage = user && (msg.userSeqId === user.seqId || msg.userId === user.userId);
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMyMessage
                        ? "rounded-br-md bg-blue-500 text-white"
                        : "rounded-bl-md bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {!isMyMessage && msg.userName && (
                      <p className="mb-1 text-xs font-medium opacity-70">
                        {msg.userName}
                      </p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p className={`mt-1 text-xs ${isMyMessage ? "opacity-70" : "opacity-50"}`}>
                      {msg.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? "메시지 입력..." : "연결 중..."}
            disabled={!connected}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!connected || !input.trim()}
            className="rounded-xl bg-blue-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
