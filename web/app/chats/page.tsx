"use client";

import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import Menu from "./Menu";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { SocketContext, SocketProvider } from "@/contexts/socketContext";

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toUser, setToUser] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      router.push("/login");
    }

    setToken(jwtToken);
  }, []);

  return (
    <SocketProvider token={token}>
      <div className="flex flex-col h-screen">
        <header className="flex-none h-12 w-screen bg-sky-200 flex justify-end items-center">
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="!w-9 !h-9 text-white mx-2 hover:cursor-pointer"
              onClick={() => {
                setIsMenuVisible((prev) => {
                  const newValue = !prev;
                  return newValue;
                });
              }}
            ></FontAwesomeIcon>
            {isMenuVisible && (
              <div className="absolute right-0 w-30 bg-white shadow-lg rounded-md">
                <Menu setIsMenuVisible={setIsMenuVisible}></Menu>
              </div>
            )}
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-1/3 p-2 overflow-y-auto">
            <ChatList
              token={token}
              setConversationId={setConversationId}
              toUser={toUser}
              setToUser={setToUser}
            />
          </aside>
          <main className="w-2/3 p-2">
            <Conversation
              setConversationId={setConversationId}
              token={token}
              conversationId={conversationId}
              toUser={toUser}
              setToUser={setToUser}
            />
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
