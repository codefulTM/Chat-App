"use client";

import { useEffect, useState } from "react";
import { createSecureContext } from "tls";

export default function Conversation({
  conversationId,
  setConversationId,
  token,
  toUser,
  setToUser,
}: {
  conversationId: string | null;
  setConversationId: any;
  token: string | null;
  toUser: any;
  setToUser: any;
}) {
  const [displayName, setDisplayName] = useState<string>("");
  const [users, setUsers] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?name=${displayName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.message);
        }
      });
  }, [displayName, token]);

  useEffect(() => {
    if (!toUser) {
      return;
    }
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${toUser._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConversationId(data.message._id);
        }
      });
  }, [toUser, token]);

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center gap-4">
        <input
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          type="search"
          name="user_search"
          id="user_search"
          placeholder="Search users..."
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
        />
        <ul className="list-none flex flex-col gap-2">
          {users.map((user) => {
            return (
              <li
                key={user._id}
                onClick={() => {
                  setToUser({ ...user });
                }}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
              >
                {user.displayName}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <h1 className="text-2xl font-bold p-4 border-b">{toUser?.displayName}</h1>

      {/* Messages chiếm toàn bộ phần còn lại */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message._id} className="border-b border-gray-300 p-2">
            <h2 className="text-lg font-bold">{message.sender}</h2>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {/* Input luôn dính dưới */}
      <div className="p-4 border-t">
        <input
          type="text"
          name="submitText"
          id="submitText"
          placeholder="Enter text here"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
