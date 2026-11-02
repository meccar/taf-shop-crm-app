export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type ProductSortField =
  | "name"
  | "sku"
  | "price"
  | "stockQuantity"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StockHealthFilter =
  | "ALL"
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export interface ProductFilters {
  storeId: string;
  search?: string;
  categoryId?: string | "ALL";
  status?: ProductStatus | "ALL";
  stockHealth?: StockHealthFilter;
  sortBy?: ProductSortField;
  sortOrder?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface ProductsListResponse {
  data: Product[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalStoreProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
}
