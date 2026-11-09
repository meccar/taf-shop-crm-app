import * as React from "react";
import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";

export const metadata: Metadata = {
  title: "Sign In — Shop CRM",
  description: "Sign in to manage your multi-store retail CRM workspace.",
};

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginView />
    </React.Suspense>
  );
}
