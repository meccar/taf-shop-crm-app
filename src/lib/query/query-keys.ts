import type { StoreFilters } from "@/features/stores/types/store.types";
import type { ProductFilters } from "@/features/products/types/product.types";
import type { CategoryFilters } from "@/features/categories/types/category.types";

export const storeKeys = {
  all: ["stores"] as const,
  lists: () => [...storeKeys.all, "list"] as const,
  list: (filters: StoreFilters) => [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, "detail"] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (storeId: string) =>
    [...dashboardKeys.all, "summary", storeId] as const,
  activity: () => [...dashboardKeys.all, "activity"] as const,
};

export const settingsKeys = {
  all: ["settings"] as const,
  workspace: () => [...settingsKeys.all, "workspace"] as const,
};
