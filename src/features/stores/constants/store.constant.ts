export enum StoreStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  PENDING = 2,
}

export const STORE_STATUS_VALUES = [
  StoreStatus.ACTIVE,
  StoreStatus.INACTIVE,
  StoreStatus.PENDING,
] as const;

export const STORE_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "slug",
] as const;
export type StoreSortField = (typeof STORE_SORT_FIELDS)[number];

export const EXPORT_FORMATS = ["csv", "xlsx", "json"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
