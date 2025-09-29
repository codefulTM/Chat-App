"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";

export default function ChatList({
  token,
  setConversationId,
}: {
  token: string | null;
  setConversationId?: any;
}) {
  const socket = useSocket();
  const { user } = useAuth();
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
          console.log(conversations);
        }
      })
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div>
      <button
        onClick={() => {
          setConversationId(null);
        }}
      >
        Create new conversation
      </button>
      {conversations.map((conversation) => {
        // Find the other user in the conversation(not the current user)
        const user1 = conversation.members[0];
        const user2 = conversation.members[1];
        let otherUser = undefined;
        if (user1._id !== user?.id) {
          otherUser = user1;
        } else {
          otherUser = user2;
        }
        return (
          <div
            key={conversation._id}
            onClick={() => {
              setConversationId(conversation._id);
            }}
          >
            <h1>{otherUser?.displayName}</h1>
            <p>{conversation.lastMessage?.content}</p>
          </div>
        );
      })}
    </div>
  );
}
