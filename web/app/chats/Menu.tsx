"use client";

import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { useState } from "react";

export default function Menu({ setIsMenuVisible }: { setIsMenuVisible: any }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);

  const handleSignOut = () => {
    destroyCookie(null, "jwt", { path: "/" });
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-y-2 p-2 bg-[var(--surface)] rounded-md shadow-lg border border-[var(--border)]">
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
            onClick={() => {
              document.documentElement.classList.remove("dark");
              localStorage.setItem("theme", "light");
              setIsDark(false);
            }}
            className="block w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200"
          >
            Light
          </button>
          <button
            onClick={() => {
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
              setIsDark(true);
            }}
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
