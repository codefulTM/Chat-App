"use client";

import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { parseCookies } from "nookies";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toUser, setToUser] = useState<any>(null);
  const [shouldAutoSelectGemini, setShouldAutoSelectGemini] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cookies = parseCookies();
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      router.push("/login");
    }

    setToken(jwtToken);

    // Check if we should auto-select Gemini
    const geminiParam = searchParams.get('gemini');
    if (geminiParam === 'true') {
      setShouldAutoSelectGemini(true);
    }
  }, [searchParams]);

  // Auto-select Gemini when component mounts and token is available
  useEffect(() => {
    if (shouldAutoSelectGemini && token && !toUser) {
      // Fetch Gemini user info from database
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?name=gemini`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.message.length > 0) {
            // Find Gemini user in the results
            const geminiUser = data.message.find((user: any) => user.username === "gemini");
            if (geminiUser) {
              setToUser(geminiUser);
            }
          }
          setShouldAutoSelectGemini(false);
        })
        .catch((err) => {
          console.error("Error fetching Gemini user:", err);
          setShouldAutoSelectGemini(false);
        });
    }
  }, [shouldAutoSelectGemini, token, toUser]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-1/3 p-2 overflow-y-auto">
        <ChatList
          token={token}
          setConversationId={setConversationId}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </aside>
      <main className="w-2/3 p-2 overflow-y-auto">
        <Conversation
          setConversationId={setConversationId}
          token={token}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </main>
    </div>
  );
}
