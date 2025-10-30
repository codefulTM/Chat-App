"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import useSocket from "@/hooks/useSocket";

export default function Menu({ setIsMenuVisible }: { setIsMenuVisible: any }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socket = useSocket();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process...");

      // 1. Disconnect socket if exists
      if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
      }

      // 2. Clear the JWT cookie
      console.log("Clearing JWT cookie...");
      signOut();

      // 3. Redirect to login page without full page reload
      console.log("Redirecting to login...");
      router.push("/login");
      router.refresh(); // Ensure client-side cache is cleared
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Khắc phục lỗi hydration bằng cách đọc localStorage an toàn
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const isDarkMode =
        savedTheme === "dark" ||
        (!savedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      setIsDark(isDarkMode);
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsMenuVisible]);

  const handleThemeChange = (theme: "light" | "dark") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      setIsDark(theme === "dark");
    }
  };

  return (
    <div
      ref={menuRef}
      className="flex flex-col gap-y-2 p-2 bg-[var(--surface)] rounded-md shadow-lg border border-[var(--border)]"
    >
      <span className="block p-2 text-center text-xl font-bold text-[var(--text)] rounded-md">
        {user?.username}
      </span>
      <span
        className="block p-2 hover:bg-[var(--primary)] cursor-pointer text-[var(--text)] text-base rounded-md hover:text-[var(--background)] transition-colors duration-200"
        onClick={handleSignOut}
      >
        Sign out
      </span>
      <div className="relative group">
        <span className="block p-2 hover:bg-[var(--primary)] cursor-pointer flex items-center text-[var(--text)] text-base rounded-md hover:text-[var(--background)] transition-colors duration-200">
          <span className="mr-2">▼</span>
          Theme
        </span>
        <div className="absolute right-full top-0 mr-2 w-32 bg-[var(--surface)] rounded-md shadow-lg py-1 z-10 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:delay-200 border border-[var(--border)] text-base">
          <button
            onClick={() => handleThemeChange("light")}
            className="block w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200"
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className="block w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200"
          >
            Dark
          </button>
        </div>
      </div>
      <span
        className="block p-2 hover:bg-[var(--primary)] text-[var(--text)] cursor-pointer rounded-md hover:text-[var(--background)] transition-colors duration-200"
        onClick={() => {
          setIsMenuVisible(false);
        }}
      >
        Close
      </span>
    </div>
  );
}
