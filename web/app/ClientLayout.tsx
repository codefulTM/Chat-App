"use client";

import { useState, useEffect } from "react";
import { parseCookies } from "nookies";
import { SocketProvider } from "@/contexts/socketContext";
import Header from "./chats/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Parse cookies on client side
    const cookies = parseCookies();
    setToken(cookies.jwt || null);
  }, []);

  return (
    <SocketProvider token={token}>
      <div className="flex flex-col h-screen overflow-x-hidden">
        <Header
          isMenuVisible={isMenuVisible}
          setIsMenuVisible={setIsMenuVisible}
        />
        {children}
      </div>
    </SocketProvider>
  );
}
