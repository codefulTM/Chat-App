"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import { useEffect, useRef, useState, useCallback } from "react";

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
  const [currentReadMessage, setCurrentReadMessage] = useState<any>(null);
  const [messagePage, setMessagePage] = useState<number>(1);
  const [perMessagePage, setPerMessagePage] = useState<number>(10);
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // search for users
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

  // get conversation info
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

  // get messages from conversation
  useEffect(() => {
    setMessages([]);
    setMessagePage(1);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/messages?limit=${perMessagePage}&skip=0`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShouldScrollToBottom(true);
          setMessages([...data.message].reverse());
        }
      });
  }, [conversationId]);

  // handle socket.io events
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (payload: any) => {
      setShouldScrollToBottom(true);
      setMessages((messages: any) => [...messages, payload.message]);
    };

    const handleMessageRead = (payload: any) => {
      console.log("handling message read...");
      setMessages((messages: any) =>
        messages.map((msg: any) =>
          msg._id === payload.messageId ? { ...msg, status: "read" } : msg
        )
      );
    };

    socket.on("private_message", handlePrivateMessage);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket]);

  // Handle message seen when it comes into view
  useEffect(() => {
    if (!socket || !conversationId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId) {
              const message = messages.find((m: any) => m._id === messageId);
              // Only mark as seen if it's not our own message and not already read
              if (
                message &&
                message.sender._id !== user?.id &&
                message.status !== "read"
              ) {
                socket.emit("message_read", {
                  messageId,
                });
              }
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the message is visible
    );

    // Observe all message elements
    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [messages, socket, conversationId, user?.id]);

  // Set up message ref callback
  const setMessageRef = useCallback(
    (messageId: string, el: HTMLDivElement | null) => {
      if (el) {
        messageRefs.current[messageId] = el;
      } else {
        delete messageRefs.current[messageId];
      }
    },
    []
  );

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [messages]);

  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].status === "read") {
        setCurrentReadMessage(messages[i]);
        return;
      }
    }
  }, [messages]);

  // handle send message
  const handleSendMessage = () => {
    if (!text.trim()) return;
    try {
      socket?.emit("private_message", {
        toUserId: toUser._id,
        conversationId: conversationId,
        content: text,
      });
      setText("");
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // handle for when the messages are scrolled
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      const newMessagePage = messagePage + 1;
      setMessagePage(newMessagePage);
      // fetch for new messages then update the messages states
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/conversations/${conversationId}/messages?limit=${perMessagePage}&skip=${
        (newMessagePage - 1) * perMessagePage
      }`;
      console.log(url);
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // if there is no data to update -> decrease message page by 1
            if (data.message.length === 0) {
              setMessagePage((prev) => Math.max(prev - 1, 1));
            } else {
              setMessages((prevMessages: any) => [
                ...[...data.message].reverse(),
                ...prevMessages,
              ]);
            }
          }
        });
    }
  };

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
          {users.map((user: any) => {
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
      <div
        className="flex-1 overflow-y-auto space-y-4"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((message: any, index: number) => {
          const showName =
            index === 0 ||
            messages[index - 1].sender._id !== message.sender._id;
          return (
            <div
              key={message._id}
              ref={(el) => setMessageRef(message._id, el)}
              data-message-id={message._id}
              className={`p-2 ${
                message.sender._id === user?.id ? "text-right" : "text-left"
              }`}
            >
              {showName && (
                <h2 className="text-lg font-bold">
                  {message.sender.displayName}
                </h2>
              )}
              <div
                className={`flex ${
                  message.sender._id === user?.id ? "justify-end" : ""
                }`}
              >
                <p
                  className={`${
                    message.sender._id === user?.id
                      ? "bg-sky-300"
                      : "bg-stone-300"
                  } p-2 rounded-md max-w-100`}
                >
                  {message.content}
                </p>
              </div>
              {message.sender._id === user?.id &&
                message._id === currentReadMessage?._id && <i>Read</i>}
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input luôn dính dưới */}
      <div className="p-4 border-t">
        <input
          type="text"
          name="submitText"
          id="submitText"
          placeholder="Enter text here"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim() !== "") {
              handleSendMessage();
              setText("");
            }
          }}
        />
      </div>
    </div>
  );
}
