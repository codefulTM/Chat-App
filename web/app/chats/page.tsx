"use client";

import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { SocketContext, SocketProvider } from "@/contexts/socketContext";

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      router.push("/login");
    }

    setToken(jwtToken);
  }, []);

  return (
    <SocketProvider token={token}>
      <div className="flex">
        <aside className="w-1/3">
          <ChatList />
        </aside>
        <main className="w-2/3">
          <Conversation />
        </main>
      </div>
    </SocketProvider>
  );
}
