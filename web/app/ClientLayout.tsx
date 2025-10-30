"use client";

import { useEffect, useState } from "react";
import { SocketProvider } from "@/contexts/socketContext";
import Header from "./chats/Header";
import useAuth from "@/hooks/useAuth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { jwtToken, loading } = useAuth();
  console.log("ClientLayout render, jwtToken:", jwtToken, "loading:", loading);

  return (
    <SocketProvider jwtToken={jwtToken} loading={loading}>
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
