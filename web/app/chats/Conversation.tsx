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
  const [currentUserId, setCurrentUserId] = useState<string>("");

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
    console.log("hello world");
    if (!currentUserId) {
      return;
    }
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${currentUserId}`,
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
  }, [currentUserId]);

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
                  setCurrentUserId(user._id);
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
  return <div>Conversation</div>;
}
