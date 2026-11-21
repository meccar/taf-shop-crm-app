"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function RequireActiveStore() {
  const tShell = useTranslations("common.shell");
  const tStores = useTranslations("stores");

  return (
    <EmptyState
      icon={Store}
      title={tShell("requireActiveStoreTitle")}
      description={tShell("requireActiveStoreDescription")}
      action={
        <Button
          nativeButton={false}
          render={<Link href="/stores">{tStores("title")}</Link>}
        />
      }
    />
  );
}
