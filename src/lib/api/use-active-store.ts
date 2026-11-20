"use client";

import { useSyncExternalStore } from "react";
import { getActiveStoreId, subscribeActiveStoreId } from "./store-context";

export function useActiveStoreId(): string | null {
  return useSyncExternalStore(
    subscribeActiveStoreId,
    getActiveStoreId,
    () => null,
  );
}
