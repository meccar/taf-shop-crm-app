import { PaginatedResponse } from "@/lib/api/types";

export interface StoreInventoryStats {
  skuCount: number;
  inStockRate: number;
  lowStockCount: number;
}

export interface StoreManager {
  id: string;
  name: string;
  email: string;
}

export interface StoreListItem extends Store {
  inventoryStats?: StoreInventoryStats;
  manager?: StoreManager | null;
}

export enum StoreFormat {
  RESTAURANT = 0,
  CAFE = 1,
  BAR = 2,
  FAST_FOOD = 3,
  FOOD_COURT = 4,
  BAKERY = 5,
  CLOUD_KITCHEN = 6,

  RETAIL_STORE = 7,
  SUPERMARKET = 8,
  CONVENIENCE_STORE = 9,
  DEPARTMENT_STORE = 10,
  SPECIALTY_STORE = 11,
}

export enum StoreStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface Store {
  id: string;
  customerId: string;

  code: string;
  name: string;
  slug: string;

  format: StoreFormat;
  isActive: boolean;

  description: string | null;

  address: string;
  cityStateZip: string;

  phone: string | null;
  email: string | null;

  taxRate: number;

  managerId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface StoreFilters {
  search?: string;
  isActive?: boolean;
  customerId: string | null;
  page?: number;
  limit?: number;
  sortBy?: "name" | "slug" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
export interface StoreMetricsSummary {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalCatalogSkus: number;
  inactiveStoreLabel: string | null;
}

export type StoresListResponse = PaginatedResponse<Store>;
