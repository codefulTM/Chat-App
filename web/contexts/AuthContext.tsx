"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { destroyCookie, parseCookies, setCookie } from "nookies";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  jwtToken: string | null;
  loading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const updateAuthState = useCallback(() => {
    setLoading(true);
    try {
      const cookies = parseCookies();
      const token = cookies.jwt;
      setJwtToken(token || null);

      if (token) {
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
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      setUser(null);
      setJwtToken(null);
      destroyCookie(null, "jwt", { path: "/" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  const signIn = (token: string) => {
    setCookie(null, "jwt", token, {
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    updateAuthState();
  };

  const signOut = () => {
    destroyCookie(null, "jwt", { path: "/" });
    setUser(null);
    setJwtToken(null);
  };

  const value = { user, jwtToken, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};