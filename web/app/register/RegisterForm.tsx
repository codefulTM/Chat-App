"use client";

import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
    <div className="h-screen flex items-center justify-center bg-sky-300">
      <form className="bg-stone-50 p-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-300 py-2 px-2 flex justify-between">
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
            Username:
          </label>
          <input
            className="w-100 py-2"
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="my-2">
          <label className="block font-bold" htmlFor="email">
            Email:
          </label>
          <input
            className="w-100 py-2"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="my-2">
          <label className="block font-bold" htmlFor="password">
            Password:
          </label>
          <input
            className="w-100 py-2"
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
        <div className="my-2">
          <label className="block font-bold" htmlFor="email">
            Display name:
          </label>
          <input
            className="w-100 py-2"
            type="text"
            name="displayName"
            id="displayName"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
          />
        </div>
        <div className="flex justify-center">
          <button
            className="bg-sky-300 px-5 py-2 hover:cursor-pointer hover:bg-sky-400"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
