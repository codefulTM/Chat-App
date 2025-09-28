"use client";

import useSocket from "@/hooks/useSocket";
import { devIndicatorServerState } from "next/dist/server/dev/dev-indicator-server-state";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";

export default function ChatList({
  token,
  setConversationId,
}: {
  token: string | null;
  setConversationId?: any;
}) {
  const socket = useSocket();
  const [conversations, setConversations] = useState<any>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConversations(data.message);
        }
      })
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div>
      <button>Create new conversation</button>
      {conversations.map((conversation) => {
        return (
          <div key={conversation._id}>
            <h1>
              {conversation.members[0]} - {conversation.members[1]}
            </h1>
            <p>{conversation.lastMessage}</p>
          </div>
        );
      })}
    </div>
  );
}
