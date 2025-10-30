"use client";

import useAuth from "@/hooks/useAuth";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

export const SocketContext = createContext<SocketContextType>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  jwtToken: string | null;
  loading: boolean;
}

export const SocketProvider = ({
  children,
  jwtToken,
  loading,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketContextType>(null);

  console.log(
    "SocketProvider render, jwtToken:",
    jwtToken,
    "loading:",
    loading
  );
  useEffect(() => {
    console.log("1. useEffect running, token:", jwtToken, "loading:", loading);

    if (loading) {
      console.log("1.1 Still loading, waiting...");
      return;
    }

    if (!jwtToken) {
      console.log("2. No token, cleaning up socket");
      setSocket((prevSocket) => {
        if (prevSocket) {
          console.log("Disconnecting previous socket");
          prevSocket.disconnect();
        }
        return null;
      });
      return;
    }

    console.log("3. Creating socket...");
    console.log("3.1 Creating new socket connection with token:", jwtToken);
    const socketIo = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        auth: {
          token: `Bearer ${jwtToken}`,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    // Thêm các sự kiện để debug
    const connectHandler = () => {
      console.log("Socket connected:", socketIo.id);
    };

    const errorHandler = (error: Error) => {
      console.error("Socket connection error:", error);
    };

    socketIo.on("connect", connectHandler);
    socketIo.on("connect_error", errorHandler);

    console.log("4. Socket created:", socketIo);
    setSocket(socketIo);

    // Cleanup function
    return () => {
      console.log("5. Cleaning up socket listeners and disconnecting");
      socketIo.off("connect", connectHandler);
      socketIo.off("connect_error", errorHandler);

      if (socketIo.connected) {
        console.log("5.1 Disconnecting socket");
        socketIo.disconnect();
      }
    };
  }, [jwtToken, loading]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
