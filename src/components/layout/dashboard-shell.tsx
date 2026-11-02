"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Suspense } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useActiveStore();

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block" />
        }
      >
        <AppSidebar />
      </Suspense>
      <div
        className={cn(
          "transition-[padding-left] duration-150",
          isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]",
        )}
      >
        <Suspense
          fallback={
            <header className="sticky top-0 z-40 h-16 border-b bg-background" />
          }
        >
          <AppHeader />
          <main className="min-h-screen pt-16">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
              {children}
            </div>
          </main>
        </Suspense>
      </div>
    </div>
  );
}
