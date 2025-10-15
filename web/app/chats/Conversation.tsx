"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentReadMessage, setCurrentReadMessage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [messagePage, setMessagePage] = useState<number>(1);
  const [perMessagePage, setPerMessagePage] = useState<number>(10);
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Theo dõi thay đổi theme
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Kiểm tra lần đầu
    checkDarkMode();

    // Tạo MutationObserver để theo dõi thay đổi class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
          const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
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
  const handleSendMessage = async () => {
    if ((!text.trim() && !selectedFile) || !toUser) {
      return;
    }
    try {
      let fileUrl = "";
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (data.success) {
          fileUrl = data.fileUrl;
        }
      }

      socket?.emit("private_message", {
        toUserId: toUser._id,
        conversationId: conversationId,
        content: text,
        fileUrl: fileUrl,
        fileName: selectedFile?.name || "",
        type: selectedFile ? "file" : "text",
      });
      setText("");
      setSelectedFile(null);
      setIsUploading(false);
    } catch (err) {
      console.error("Error sending message: ", err);
      setIsUploading(false);
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

  // handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      e.target.value = "";
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center gap-4">
        <input
          className={`w-full px-4 py-2 ${
            isDarkMode ? "bg-[var(--surface)]" : "bg-white"
          } border border-[var(--border)] ${
            isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"
          } rounded-md shadow-sm focus:ring-[var(--primary)] focus:border-[var(--primary)]`}
          type="search"
          autoComplete="off"
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
                className={`flex flex-col ${
                  message.sender._id === user?.id ? "items-end" : "items-start"
                }`}
              >
                {message.content !== "" && (
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
                        code({ node, className, children, ...props }) {
                          const isInline =
                            !className || !className.includes("language-");

                          return !isInline ? (
                            <pre className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 text-white rounded-md my-2 ">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code
                              className={`${className} inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm align-baseline text-white`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {/* {message.content} */}
                  </div>
                )}
                {message.fileUrl &&
                  (() => {
                    // Check if file is an image
                    const isImage =
                      message.fileName &&
                      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(message.fileName);

                    return isImage ? (
                      <div className="mt-2">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`}
                          alt={message.fileName || "Image"}
                          className="max-w-xs max-h-64 rounded-md cursor-pointer hover:opacity-90"
                          onClick={() =>
                            window.open(
                              `${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`,
                              "_blank"
                            )
                          }
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div className="mt-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {message.fileName || "Download File"}
                        </a>
                      </div>
                    );
                  })()}
              </div>
              {message.sender._id === user?.id &&
                message._id === currentReadMessage?._id && <i>Read</i>}
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input luôn dính dưới */}
      <div className="p-4 border-t flex items-center gap-2">
        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </label>

        <div className="relative flex-1">
          <input
            type="text"
            name="submitText"
            id="submitText"
            placeholder="Nhập tin nhắn..."
            className={`w-full pr-12 pl-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text)]`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
                setText("");
              }
            }}
            disabled={isUploading}
          />

          <button
            onClick={() => {
              if (text.trim() || selectedFile) {
                handleSendMessage();
                setText("");
              }
            }}
            disabled={isUploading || (!text.trim() && !selectedFile)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white bg-[var(--primary)] rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      {selectedFile && (
        <div className="px-4 pb-2 flex items-center text-sm text-gray-600">
          <span className="truncate max-w-xs">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
