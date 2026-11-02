"use client";

import * as React from "react";
import { useStores } from "@/features/stores/api/store.queries";
import type { Store } from "@/features/stores/types/store.types";

const ACTIVE_STORE_STORAGE_KEY = "shop_crm_active_store_id";
const SIDEBAR_COLLAPSED_KEY = "shop_crm_sidebar_collapsed";
const DEFAULT_STORE_ID = "store-1";

interface ActiveStoreContextValue {
  activeStoreId: string;
  activeStore: Store | null;
  stores: Store[];
  isLoadingStores: boolean;
  setActiveStoreId: (storeId: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const ActiveStoreContext = React.createContext<
  ActiveStoreContextValue | undefined
>(undefined);

export function ActiveStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeStoreId, setActiveStoreIdState] =
    React.useState<string>(DEFAULT_STORE_ID);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    React.useState<boolean>(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const { data: storesResponse, isLoading: isLoadingStores } = useStores({
    page: 1,
    pageSize: 100,
  });

  const stores = React.useMemo(
    () => storesResponse?.data ?? [],
    [storesResponse?.data],
  );

  React.useEffect(() => {
    try {
      const savedStoreId = window.localStorage.getItem(
        ACTIVE_STORE_STORAGE_KEY,
      );
      if (savedStoreId) {
        setActiveStoreIdState(savedStoreId);
      }
      const savedCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedCollapsed === "true") {
        setIsSidebarCollapsed(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setActiveStoreId = React.useCallback((nextStoreId: string) => {
    setActiveStoreIdState(nextStoreId);
    try {
      window.localStorage.setItem(ACTIVE_STORE_STORAGE_KEY, nextStoreId);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleSidebarCollapsed = React.useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  }, []);

  // Keyboard shortcut '[' to collapse/expand sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (
        !isEditable &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key === "["
      ) {
        event.preventDefault();
        toggleSidebarCollapsed();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapsed]);

  // Ensure activeStoreId always points to an existing store if one was deleted
  React.useEffect(() => {
    if (stores.length > 0 && !stores.some((s) => s.id === activeStoreId)) {
      const fallback = stores.find((s) => s.status === "ACTIVE") ?? stores[0];
      if (fallback) {
        setActiveStoreId(fallback.id);
      }
    }
  }, [stores, activeStoreId, setActiveStoreId]);

  const activeStore = React.useMemo(
    () => stores.find((s) => s.id === activeStoreId) ?? stores[0] ?? null,
    [stores, activeStoreId],
  );

  const contextValue = React.useMemo<ActiveStoreContextValue>(
    () => ({
      activeStoreId: activeStore?.id ?? activeStoreId,
      activeStore,
      stores,
      isLoadingStores,
      setActiveStoreId,
      isSidebarCollapsed,
      toggleSidebarCollapsed,
      isMobileMenuOpen,
      setMobileMenuOpen,
    }),
    [
      activeStore,
      activeStoreId,
      stores,
      isLoadingStores,
      setActiveStoreId,
      isSidebarCollapsed,
      toggleSidebarCollapsed,
      isMobileMenuOpen,
    ],
  );

  return (
    <ActiveStoreContext.Provider value={contextValue}>
      {children}
    </ActiveStoreContext.Provider>
  );
}

export function useActiveStore(): ActiveStoreContextValue {
  const ctx = React.useContext(ActiveStoreContext);
  if (!ctx) {
    throw new Error("useActiveStore must be used within ActiveStoreProvider");
  }
  return ctx;
}
