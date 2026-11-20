import { z } from "zod";

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function createPaginatedResponseSchema<TItem extends z.ZodTypeAny>(
  itemSchema: TItem,
) {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
