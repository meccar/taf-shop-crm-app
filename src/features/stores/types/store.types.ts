export type StoreStatus = "ACTIVE" | "INACTIVE";

export type StoreFormat = "FLAGSHIP" | "MALL" | "OUTLET" | "POPUP";

export interface Store {
  id: string;
  code: string;
  name: string;
  slug: string;
  format: StoreFormat;
  description: string | null;
  address: string;
  cityStateZip: string;
  phone: string | null;
  email: string | null;
  managerName: string;
  managerEmail: string;
  taxRate: number;
  status: StoreStatus;
  skuCount: number;
  inStockRate: number;
  lowStockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFilters {
  search?: string;
  status?: StoreStatus | "ALL";
  format?: StoreFormat | "ALL";
  page?: number;
  pageSize?: number;
}

export interface StoreMetricsSummary {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalCatalogSkus: number;
  inactiveStoreLabel: string | null;
}

export interface StoresListResponse {
  data: Store[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: StoreMetricsSummary;
}
