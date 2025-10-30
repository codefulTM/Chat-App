"use client";

import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { parseCookies } from "nookies";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function ChatPage() {
  // const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toUser, setToUser] = useState<any>(null);
  const [shouldAutoSelectGemini, setShouldAutoSelectGemini] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { jwtToken, loading } = useAuth();

  // 2. Update the useEffect to check loading state
  useEffect(() => {
    // Only check jwtToken after loading is complete
    if (!loading) {
      if (!jwtToken) {
        // Add a small delay before redirecting for better UX
        const timer = setTimeout(() => {
          router.push("/login");
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [jwtToken, loading]);

  useEffect(() => {
    // Check if we should auto-select Gemini
    const geminiParam = searchParams.get("gemini");
    if (geminiParam === "true") {
      setShouldAutoSelectGemini(true);
    }
  }, [searchParams, jwtToken]);

  // Auto-select Gemini when component mounts and token is available
  useEffect(() => {
    if (shouldAutoSelectGemini && jwtToken && !toUser) {
      // Fetch Gemini user info from database
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?name=gemini`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.message.length > 0) {
            // Find Gemini user in the results
            const geminiUser = data.message.find(
              (user: any) => user.username === "gemini"
            );
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
  }, [shouldAutoSelectGemini, jwtToken, toUser]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-1/3 p-2 overflow-y-auto">
        <ChatList
          token={jwtToken}
          setConversationId={setConversationId}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </aside>
      <main className="w-2/3 p-2 overflow-y-auto">
        <Conversation
          setConversationId={setConversationId}
          token={jwtToken}
          conversationId={conversationId}
          toUser={toUser}
          setToUser={setToUser}
        />
      </main>
    </div>
  );
}
