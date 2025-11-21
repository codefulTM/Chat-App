"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import OnlineUsers from "./ChatListComponents/OnlineUsers";
import MessageCard from "./ChatListComponents/MessageCard";

export default function ChatList({
  token,
  setConversationId,
  conversationId,
  toUser,
  setToUser,
}: {
  token: string | null;
  setConversationId?: any;
  conversationId: string | null;
  toUser: any;
  setToUser: any;
}) {
  const socket = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.message);
          setConversations(data.message);
        }
      })
      .catch((err) => console.log(err));

    // Initial fetch of online users
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/online`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ onlineUsers }) => {
        const map = new Map();
        for (const user of onlineUsers) {
          map.set(user._id, user);
        }
        setOnlineUsers(map);
      });
  }, [token]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("private_message", (payload) => {
      const message = payload.message;
      const conversationId = message.conversationId;
      const sender = payload.sender; // Assuming sender info is included in the payload

      setConversations((prevConvs: any[]) => {
        const convIndex = prevConvs.findIndex(
          (conv: any) => conv._id === conversationId
        );

        // If conversation doesn't exist, create a new one
        if (convIndex === -1) {
          const newConversation = {
            _id: conversationId,
            members: [sender._id, message.recipient], // Adjust based on your data structure
            lastMessage: message.content,
            // Add other necessary fields from the message or sender
            ...(sender && {
              participants: [sender],
              name: sender.username, // or any other identifier
            }),
          };
          return [newConversation, ...prevConvs];
        }

        const conv = prevConvs[convIndex];
        // Update the conversation's lastMessage
        const updatedConv = { ...conv, lastMessage: message.content };

        // Remove the conversation from its current position and add it to the top
        let newConvs = prevConvs.filter(
          (_: any, index: number) => index !== convIndex
        );
        newConvs = [updatedConv, ...newConvs];

        return newConvs;
      });
    });

    // bug: When the user is online twice, the set doesn't remove the user
    const handleUserOnline = (user: any) => {
      console.log("user", user, "is online");
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(user._id, user);
        return newMap;
      });
    };

    // Bug: When the user is offline, the set doesn't remove the user
    const handleUserOffline = (user: any) => {
      console.log("user", user, "is offline");
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(user._id);
        return newMap;
      });
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("private_message");
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket]);

  const handleBubbleClick = (toUserId: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${toUserId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // console.log(data.message);
          // console.log(data.message._id);
          // console.log(
          //   data.message.members.find((member: any) => member._id !== user?.id)
          // );
          setConversationId(data.message._id);
          setToUser(
            data.message.members.find((member: any) => member._id !== user?.id)
          );
        }
      });
  };

  return (
    <div className="flex flex-col gap-2">
      <OnlineUsers
        onlineUsers={onlineUsers}
        user={user}
        onBubbleClick={handleBubbleClick}
      />
      <button
        onClick={() => {
          setConversationId(null);
        }}
        className="mx-auto px-4 py-2 bg-[var(--primary)] rounded-lg shadow-md hover:shadow-lg hover:bg-[var(--primary-light)]"
      >
        Find or create conversation
      </button>
      {conversations.map((conversation: any) => {
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
        let isOnline = false;
        for (const item of onlineUsers.values()) {
          if (item?._id === otherUser._id) {
            isOnline = true;
            break;
          }
        }

        return (
          <MessageCard
            key={conversation._id}
            conversation={conversation}
            onMessageCardClick={() => {
              setConversationId(conversation._id);
              setToUser(otherUser);
            }}
            currentConversationId={conversationId}
            isOnline={isOnline}
            otherUser={otherUser}
            currentUser={user}
          />
        );
      })}
    </div>
  );
}
