"use client";

import * as React from "react";
import { QueryProvider } from "@/lib/query/query-provider";
import { ActiveStoreProvider } from "@/stores/active-store-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ActiveStoreProvider>
        <TooltipProvider delay={150}>
          {children}
          <Toaster />
        </TooltipProvider>
      </ActiveStoreProvider>
    </QueryProvider>
  );
}
