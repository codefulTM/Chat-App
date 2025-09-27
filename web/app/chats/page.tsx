import ChatList from "./ChatList";
import Conversation from "./Conversation";

export default function ChatPage() {
  return (
    <div className="flex">
      <aside className="w-1/3">
        <ChatList />
      </aside>
      <main className="w-2/3">
        <Conversation />
      </main>
    </div>
  );
}
