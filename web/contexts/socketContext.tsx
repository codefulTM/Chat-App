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
  const [socket, setSocket] = useState<SocketContextType>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const socketIo = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
