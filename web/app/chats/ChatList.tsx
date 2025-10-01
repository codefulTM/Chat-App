"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";

export default function ChatList({
  token,
  setConversationId,
  toUser,
  setToUser,
}: {
  token: string | null;
  setConversationId?: any;
  toUser: any;
  setToUser: any;
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
        }
      })
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          setConversationId(null);
        }}
        className="mx-auto px-4 py-2 bg-sky-300 rounded-lg shadow-md hover:shadow-lg hover:bg-sky-400"
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
        // console.log(conversation);
        return (
          <div
            key={conversation._id}
            onClick={() => {
              setConversationId(conversation._id);
              setToUser(otherUser);
            }}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100"
          >
            <h1 className="text-lg font-bold">{otherUser?.displayName}</h1>
            <p className="text-sm">{conversation.lastMessage}</p>
          </div>
        );
      })}
    </div>
  );
}
