export type CategoryStatus = "ACTIVE" | "INACTIVE";

export type CategoryIconKey =
  | "utensils"
  | "shirt"
  | "lamp"
  | "pen-tool"
  | "sparkles"
  | "sun"
  | "gift"
  | "archive"
  | "layers";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: CategoryIconKey;
  posOrder: number;
  status: CategoryStatus;
  appliesToAllStores: boolean;
  storeIds: string[];
  productCount: number;
  activeStoreProductCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryOccupancyFilter = "ALL" | "WITH_PRODUCTS" | "EMPTY";

export interface CategoryFilters {
  search?: string;
  occupancy?: CategoryOccupancyFilter;
  storeId?: string;
  page?: number;
  pageSize?: number;
}

export interface CategoriesListResponse {
  data: Category[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  counts: {
    all: number;
    withProducts: number;
    empty: number;
    activeCategories: number;
    totalAssignedSkus: number;
  };
}
