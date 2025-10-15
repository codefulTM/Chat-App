"use client";

import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toUser, setToUser] = useState<any>(null);
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
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-1/3 p-2 overflow-y-auto">
        <ChatList
          token={token}
          setConversationId={setConversationId}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </aside>
      <main className="w-2/3 p-2 overflow-y-auto">
        <Conversation
          setConversationId={setConversationId}
          token={token}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </main>
    </div>
  );
}
