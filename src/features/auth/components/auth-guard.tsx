"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getActiveStoreId } from "@/lib/api/store-context";
import { getAccessToken } from "@/lib/api/token-store";
import { refreshSession } from "../api/auth.api";
import { ensureDefaultActiveStore } from "../api/auth.queries";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [ready, setReady] = useState<boolean>(() => Boolean(getAccessToken()));

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (getAccessToken()) {
        if (!getActiveStoreId()) {
          await ensureDefaultActiveStore().catch(() => undefined);
        }
        if (active) setReady(true);
        return;
      }

      const token = await refreshSession();
      if (!active) return;

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!getActiveStoreId()) {
        await ensureDefaultActiveStore().catch(() => undefined);
      }
      if (active) setReady(true);
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink">
        <Loader2 className="h-6 w-6 animate-spin text-action" />
        <p className="text-sm text-muted">{t("checkingSession")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
