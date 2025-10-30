"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          displayName: displayName,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--background)]">
      <form 
        className="bg-[var(--surface)] p-8 rounded-lg shadow-lg w-full max-w-md" 
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">Create an Account</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex justify-between items-center">
            <p>{error}</p>
            <button
              className="text-red-700 hover:text-red-900"
              onClick={() => setError(null)}
              aria-label="Close error message"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-[var(--text)] text-sm font-medium mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-[var(--text)] text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-[var(--text)] text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            type="password"
            name="password"
            id="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-[var(--text)] text-sm font-medium mb-2" htmlFor="displayName">
            Display Name
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            type="text"
            name="displayName"
            id="displayName"
            placeholder="What should we call you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <button
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-medium py-2 px-4 rounded-md transition-colors"
            type="submit"
          >
            Create Account
          </button>
          
          <div className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <button
              className="text-[var(--primary)] hover:underline focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
