"use client";

import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

export const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) => {
  console.log("Rerendered");
  const [socket, setSocket] = useState<SocketContextType>(null);
  // console.log(token);
  useEffect(() => {
    // console.log("1. useEffect running, token:", token); // Kiểm tra token

    if (!token) {
      // console.log("2. No token, returning early");
      setSocket(null);
      return;
    }

    // console.log("3. Creating socket...");
    const socketIo = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    // Thêm các sự kiện để debug
    socketIo.on("connect", () => {
      // console.log("Socket connected:", socketIo.id);
    });

    socketIo.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // console.log("4. Socket created:", socketIo);
    setSocket(socketIo);

    return () => {
      // console.log("5. Cleaning up socket...");
      socketIo.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
