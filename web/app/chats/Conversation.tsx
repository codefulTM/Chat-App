"use client";

import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Header from "./ConversationComponents/Header";
import UserSearch from "./ConversationComponents/UserSearch";
import MessagesList from "./ConversationComponents/MessagesList";
import MessageInput from "./ConversationComponents/MessageInput";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [text, setText] = useState<string>("");
  const { isDarkMode } = useTheme();
  const [messagePage, setMessagePage] = useState<number>(1);
  const [perMessagePage, setPerMessagePage] = useState<number>(10);
  const [isConversationReady, setIsConversationReady] =
    useState<boolean>(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const shouldScrollToBottomRef = useRef<boolean>(false);
  // console.log(conversationId);

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
          // Find Gemini user in the results instead of creating it manually
          const geminiUser = data.message.find(
            (user: any) => user.username === "gemini"
          );
          if (geminiUser) {
            // Filter out existing gemini user and add our found one
            const filteredUsers = data.message.filter(
              (user: any) => user.username !== "gemini"
            );
            setUsers([...filteredUsers, geminiUser]);
          } else {
            setUsers(data.message);
          }
        }
      });
  }, [displayName, token]);

  // get conversation info
  useEffect(() => {
    if (!toUser) {
      setIsConversationReady(false);
      return;
    }
    // console.log(toUser);
    // Special handling for Gemini AI
    if (toUser.username === "gemini") {
      // Create or find conversation with Gemini
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/gemini`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setConversationId(data.message._id);
            setIsConversationReady(true); // Mark conversation as ready
          }
        })
        .catch((err) => {
          console.error("Error creating Gemini conversation:", err);
        });
    } else {
      // Regular user conversation
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
            setIsConversationReady(true); // Mark conversation as ready
          }
        });
    }
  }, [toUser, token]);

  // get messages from conversation
  useEffect(() => {
    if (!conversationId || !isConversationReady) return;

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
          shouldScrollToBottomRef.current = true;
          setMessages(reversedMessages);
        }
      });
  }, [conversationId, token, isConversationReady]);

  // handle socket.io events
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (payload: any) => {
      // console.log(payload);
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

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      scrollToBottom();
      shouldScrollToBottomRef.current = false;
    }
  }, [messages, scrollToBottom]);

  // handle for when the messages are scrolled
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      const newMessagePage = messagePage + 1;
      setMessagePage(newMessagePage);
      // fetch for new messages then update the messages states
      const url = `${process.env.NEXT_PUBLIC_API_URL
        }/api/conversations/${conversationId}/messages?limit=${perMessagePage}&skip=${(newMessagePage - 1) * perMessagePage
        }`;
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
              // Get the first message element before updating messages
              const firstMessageElement =
                messages.length > 0
                  ? messageRefs.current[messages[0]._id]
                  : null;

              setMessages((prevMessages: any) => {
                const newMessages = [
                  ...[...data.message].reverse(),
                  ...prevMessages,
                ];

                // After messages are updated, scroll to maintain position
                setTimeout(() => {
                  if (firstMessageElement) {
                    firstMessageElement.scrollIntoView({
                      behavior: "auto",
                      block: "start",
                    });
                  }
                }, 0);

                return newMessages;
              });
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
      <UserSearch
        displayName={displayName}
        setDisplayName={setDisplayName}
        users={users}
        setToUser={setToUser}
      />
    );
  }
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <Header toUser={toUser} />

      {/* Messages chiếm toàn bộ phần còn lại */}
      <MessagesList
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        handleScroll={handleScroll}
        setMessageRef={setMessageRef}
        user={user}
        currentReadMessage={currentReadMessage}
      />

      {/* Input luôn dính dưới */}
      <MessageInput
        text={text}
        setText={setText}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isUploading={isUploading}
        handleSendMessage={handleSendMessage}
        handleFileSelect={handleFileSelect}
      />
    </div>
  );
}
