import { destroyCookie, parseCookies, setCookie } from "nookies";
import { useCallback, useEffect, useState } from "react";
import { AuthEvent } from "../utils/authEvents";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Function to update auth state from cookies
  const updateAuthState = useCallback((event?: AuthEvent) => {
    setLoading(true);

    // If it's a sign out event, clear the state immediately
    if (event === "SIGN_OUT") {
      setUser(null);
      setLoading(false);
      return;
    }

    // Otherwise, check the cookies
    const cookies = parseCookies();
    const token = cookies.jwt;
    setJwtToken(token || null);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Decode JWT token
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const userData = JSON.parse(jsonPayload);
      setUser(userData);
    } catch (error) {
      console.error("Error parsing token:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auth state updates on mount and auth events
  useEffect(() => {
    // Initial update
    updateAuthState();
  }, [updateAuthState]);

  const signIn = (token: string) => {
    const cookieOptions = {
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    };
    setCookie(null, "jwt", token, cookieOptions);
    updateAuthState("SIGN_IN");
    const cookies = parseCookies();
    // console.log(cookies.jwt);
  };

  const signOut = () => {
    destroyCookie(null, "jwt", { path: "/" });
    updateAuthState("SIGN_OUT");
  };

  return { user, jwtToken, loading, signIn, signOut };
}
