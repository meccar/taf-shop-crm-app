"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { useAuth } from "@/stores/auth-context";
import { Suspense } from "react";
import { LoadingLoader, VerifyingLoader } from "../shared/loader";

function AuthGuardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const search = window.location.search;
      const currentUrl = search ? `${pathname}${search}` : pathname;
      const redirectParam = encodeURIComponent(currentUrl);

      router.replace(`/login?redirect=${redirectParam}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy shadow-sm">
            <Store className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Shop CRM Workspace
            </h2>
            <p className="text-xs text-muted-foreground">
              Restoring session credentials...
            </p>
          </div>

          <VerifyingLoader />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingLoader />}>
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
