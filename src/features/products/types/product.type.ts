import { z } from "zod";
import { createPaginatedResponseSchema } from "@/lib/api/pagination";
import { ProductStatus, ProductSortField } from "../constants/product.constant";

export const productSchema = z.object({
  id: z.string(),
  storeId: z.string().optional(),
  categoryId: z.string(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  price: z.union([z.number(), z.string()]),
  costPrice: z.union([z.number(), z.string()]).nullable().optional(),
  stockQuantity: z.number(),
  lowStockThreshold: z.number(),
  status: z.nativeEnum(ProductStatus),
  images: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof productSchema>;

export const productListResponseSchema =
  createPaginatedResponseSchema(productSchema);
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  lowStockOnly?: boolean;
  sortBy?: ProductSortField;
  sortOrder?: "asc" | "desc";
}
