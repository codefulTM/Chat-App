"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";

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
    if (!conversationId) return;
    
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
          const reversedMessages = [...data.message].reverse();
          setMessages(reversedMessages);
          // Always scroll to bottom when loading a conversation
          const scrollTimer = setTimeout(() => {
            scrollToBottom();
          }, 100);
          return () => clearTimeout(scrollTimer);
        }
      });
  }, [conversationId, token]);

  // handle socket.io events
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (payload: any) => {
      setMessages((messages: any) => {
        const newMessages = [...messages, payload.message];
        // Only auto-scroll if the user is near the bottom
        if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
          const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
          if (isNearBottom) {
            setTimeout(() => scrollToBottom(), 0);
          }
        }
        return newMessages;
      });
    };

    const handleMessageRead = (payload: any) => {
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

  // Remove the auto-scroll effect that was causing issues
  // We'll handle scrolling manually in specific cases

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

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

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
          className={
            `w-full px-4 py-2 bg-[var(` +
            (document.documentElement.classList.contains("dark")
              ? "--text"
              : "--background") +
            `)] border border-[var(--border)] text-[var(` +
            (document.documentElement.classList.contains("dark")
              ? "--background"
              : "--text") +
            `)] rounded-md shadow-sm focus:ring-[var(--primary)] focus:border-[var(--primary)]`
          }
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
                className="cursor-pointer hover:bg-[var(--primary)] hover:text-[var(--background)] p-2 rounded-md"
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
              className={`${
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
                <div
                  className={`${
                    message.sender._id === user?.id
                      ? "bg-[var(--primary)]"
                      : document.documentElement.classList.contains("dark")
                      ? "bg-[var(--secondary)]"
                      : "bg-[var(--surface)]"
                  } p-2 rounded-md max-w-100 prose`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p {...props} className="m-0" />
                      ),
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline ? (
                          <div className="overflow-x-auto">
                            <pre className="bg-gray-800 text-gray-100 p-3 text-sm whitespace-pre-wrap break-words">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-gray-200 px-1 rounded" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
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
          className={
            `w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(` +
            (document.documentElement.classList.contains("dark")
              ? "--text"
              : "--background") +
            `)]`
          }
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
