export const queryKeys = {
  profile: {
    all: ["profile"] as const,
    me: () => ["profile", "me"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: (storeId: string | null) =>
      ["dashboard", "overview", storeId ?? "none"] as const,
  },
  stores: {
    all: ["stores"] as const,
    lists: () => ["stores", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["stores", "list", filters] as const,
    details: () => ["stores", "detail"] as const,
    detail: (id: string) => ["stores", "detail", id] as const,
    metrics: () => ["stores", "metrics"] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => ["categories", "list"] as const,
    list: (storeId: string | null, filters: Record<string, unknown>) =>
      ["categories", "list", storeId ?? "none", filters] as const,
    details: () => ["categories", "detail"] as const,
    detail: (storeId: string | null, id: string) =>
      ["categories", "detail", storeId ?? "none", id] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => ["products", "list"] as const,
    list: (storeId: string | null, filters: Record<string, unknown>) =>
      ["products", "list", storeId ?? "none", filters] as const,
    details: () => ["products", "detail"] as const,
    detail: (storeId: string | null, id: string) =>
      ["products", "detail", storeId ?? "none", id] as const,
  },
} as const;
