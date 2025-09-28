import { SocketContext } from "@/contexts/socketContext";
import { useContext } from "react";

export default function useSocket() {
    return useContext(SocketContext);
}