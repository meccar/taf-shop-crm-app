"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { initializeSession } from "@/features/auth/api/auth.api"; // your path

type Status = "loading" | "authenticated" | "unauthenticated";
const AuthContext = createContext<{ status: Status }>({ status: "loading" });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    initializeSession().then((ok) => {
      if (!cancelled) setStatus(ok ? "authenticated" : "unauthenticated");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ status }}>{children}</AuthContext.Provider>
  );
}
