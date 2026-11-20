import { z } from "zod";
import { createPaginatedResponseSchema } from "@/lib/api/pagination";
import {
  CategoryStatus,
  CategorySortField,
} from "../constants/categories.constant";

export const categorySchema = z.object({
  id: z.string(),
  storeId: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  status: z.nativeEnum(CategoryStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoryListResponseSchema =
  createPaginatedResponseSchema(categorySchema);
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
  parentId?: string;
  sortBy?: CategorySortField;
  sortOrder?: "asc" | "desc";
}
