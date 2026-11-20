export enum CategoryStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  ARCHIVED = 2,
}

export const CATEGORY_STATUS_VALUES = [
  CategoryStatus.ACTIVE,
  CategoryStatus.INACTIVE,
  CategoryStatus.ARCHIVED,
] as const;

export const CATEGORY_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];
