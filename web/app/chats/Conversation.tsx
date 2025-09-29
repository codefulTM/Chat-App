"use client";

import { useEffect, useState } from "react";
import { createSecureContext } from "tls";

export default function Conversation({
  conversationId,
  setConversationId,
  token,
}: {
  conversationId: string | null;
  setConversationId: any;
  token: string | null;
}) {
  const [displayName, setDisplayName] = useState<string>("");
  const [users, setUsers] = useState<any>([]);
  const [currentUser, setCurrentUser] = useState<any>("");
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
  }, [displayName]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${currentUser._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setConversationId(data.message._id);
        }
      });
  }, [currentUser]);

  if (!conversationId) {
    return (
      <div>
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
        <ul>
          {users.map((user) => {
            return (
              <li
                key={user._id}
                onClick={() => {
                  setCurrentUser(user);
                }}
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
    <div>
      <h1>{currentUser.displayName}</h1>
      <ul>
        {messages.map((message) => {
          return (
            <li key={message._id}>
              <h2>{message.sender}</h2>
              <p>{message.content}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
