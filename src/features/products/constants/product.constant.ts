export enum ProductStatus {
  DRAFT = 0,
  ACTIVE = 1,
  INACTIVE = 2,
  ARCHIVED = 3,
  OUT_OF_STOCK = 4,
}

export const PRODUCT_STATUS_VALUES = [
  ProductStatus.DRAFT,
  ProductStatus.ACTIVE,
  ProductStatus.INACTIVE,
  ProductStatus.ARCHIVED,
  ProductStatus.OUT_OF_STOCK,
] as const;

export const PRODUCT_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
