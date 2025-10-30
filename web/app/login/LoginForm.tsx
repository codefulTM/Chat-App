"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { parseCookies } from "nookies";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useSocket();
  const { signIn, jwtToken, loading } = useAuth();

  // Redirect to chats if already logged in
  useEffect(() => {
    if (jwtToken) {
      router.push("/chats");
    }
  }, [jwtToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // attach jwt token to cookie
        const token = data.message;
        signIn(token);
        // The useEffect will handle the redirect when jwtToken updates
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError((err as any).message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--background)]">
      <form className="bg-[var(--surface)] p-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-[var(--error)] py-2 px-2 flex justify-between">
            <p>{error}</p>
            <button
              className="hover:cursor-pointer"
              onClick={() => setError(null)}
            >
              x
            </button>
          </div>
        )}
        <div className="my-2">
          <label className="block font-bold" htmlFor="email">
            Email:
          </label>
          <input
            className="w-100 py-2 border border-[var(--border)]"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="my-2">
          <label className="block font-bold" htmlFor="password">
            Password:
          </label>
          <input
            className="w-100 py-2 border border-[var(--border)]"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <div className="flex justify-center my-2">
          <button
            className="bg-[var(--primary)] px-5 py-2 hover:cursor-pointer hover:bg-[var(--primary-light)] w-30"
            type="submit"
          >
            Login
          </button>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-[var(--primary)] px-5 py-2 hover:cursor-pointer hover:bg-[var(--primary-light)] w-30"
            onClick={(e) => {
              e.preventDefault();
              router.push("/register");
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
