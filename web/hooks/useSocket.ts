import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(token: string) {
    let socketRef = useRef<Socket | null>(null);
    
    useEffect(() => {
        if(!token) return;
        const socket = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: {token},
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        socketRef.current = socket;
        return () => {
            socket.disconnect();
        }
    }, [token])

    return socketRef;
}