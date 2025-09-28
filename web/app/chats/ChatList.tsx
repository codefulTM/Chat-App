import useSocket from "@/hooks/useSocket";

export default function ChatList() {
  const socket = useSocket();

  socket?.on("connect", () => {});

  return <div>Chat List</div>;
}
