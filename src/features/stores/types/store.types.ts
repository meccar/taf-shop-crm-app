import { z } from "zod";
import { createPaginatedResponseSchema } from "@/lib/api/pagination";
import { StoreStatus, StoreSortField } from "../constants/store.constant";

export const storeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  code: z.string(),
  address: z.string(),
  cityStateZip: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  taxRate: z.coerce.number().default(0),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(StoreStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Store = z.infer<typeof storeSchema>;

export const storeListResponseSchema =
  createPaginatedResponseSchema(storeSchema);
export type StoreListResponse = z.infer<typeof storeListResponseSchema>;

export const storeMetricsSchema = z.object({
  total: z.number(),
  byStatus: z.object({
    active: z.number(),
    inactive: z.number(),
    pending: z.number(),
  }),
  createdLast30Days: z.number(),
});

export type StoreMetrics = z.infer<typeof storeMetricsSchema>;

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StoreStatus;
  sortBy?: StoreSortField;
  sortOrder?: "asc" | "desc";
}
