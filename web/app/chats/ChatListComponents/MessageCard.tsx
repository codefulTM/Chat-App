import { MouseEventHandler } from "react";

export default function MessageCard({
  conversation,
  onMessageCardClick,
  currentConversationId,
  isOnline,
  currentUser,
  otherUser,
}: {
  conversation: any;
  onMessageCardClick: MouseEventHandler;
  currentConversationId: string | null;
  isOnline: boolean;
  currentUser: any;
  otherUser: any;
}) {
  console.log(conversation);
  return (
    <div
      onClick={onMessageCardClick}
      className={
        "p-4 rounded-lg h-20 shadow-md hover:shadow-lg hover:bg-[var(--primary-light)] hover:text-[var(--background)] " +
        (conversation._id === currentConversationId
          ? "bg-[var(--primary)] text-[var(--background)]"
          : "bg-[var(--surface)]")
      }
    >
      <div className="flex">
        <h1 className="text-lg font-bold mr-2">{otherUser?.displayName}</h1>
        {otherUser?.username === "gemini" ? (
          <span className="font-bold bg-[var(--primary)] px-2 py-1 rounded-md text-xs items-center flex justify-center">
            AI
          </span>
        ) : (
          isOnline &&
          otherUser?._id !== currentUser?.id && (
            <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span>
          )
        )}
      </div>
      <p className="text-sm">
        {conversation.lastMessage
          ? conversation.lastMessage.slice(0, 50) +
            (conversation.lastMessage.length > 50 ? "..." : "")
          : "No messages yet"}
      </p>
    </div>
  );
}
