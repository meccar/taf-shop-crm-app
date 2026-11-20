const ACTIVE_STORE_STORAGE_KEY = "shop_crm_active_store_id";

let activeStoreId: string | null = null;
const listeners = new Set<() => void>();

export function hydrateActiveStoreId(): string | null {
  if (activeStoreId) return activeStoreId;
  if (typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem(ACTIVE_STORE_STORAGE_KEY);
      if (stored) {
        activeStoreId = stored;
      }
    } catch {
      // Ignore storage access failures in restricted environments
    }
  }
  return activeStoreId;
}

export function getActiveStoreId(): string | null {
  return hydrateActiveStoreId();
}

export function setActiveStoreId(storeId: string | null): void {
  activeStoreId = storeId;
  if (typeof window !== "undefined") {
    try {
      if (storeId) {
        window.sessionStorage.setItem(ACTIVE_STORE_STORAGE_KEY, storeId);
      } else {
        window.sessionStorage.removeItem(ACTIVE_STORE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access failures
    }
  }
  listeners.forEach((listener) => listener());
}

export function clearActiveStoreId(): void {
  setActiveStoreId(null);
}

export function subscribeActiveStoreId(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
