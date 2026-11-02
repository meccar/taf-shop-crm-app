import { z } from "zod";

export const categoryStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const categoryIconKeySchema = z.enum([
  "utensils",
  "shirt",
  "lamp",
  "pen-tool",
  "sparkles",
  "sun",
  "gift",
  "archive",
  "layers",
]);

export const categoryFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category title must be at least 2 characters")
      .max(80, "Category title cannot exceed 80 characters"),
    slug: z
      .string()
      .trim()
      .min(2, "URL slug is required")
      .max(80, "URL slug cannot exceed 80 characters")
      .regex(
        /^\/?[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens (e.g. kitchenware-dining)",
      ),
    description: z
      .string()
      .trim()
      .max(400, "Description cannot exceed 400 characters")
      .optional()
      .or(z.literal("")),
    iconKey: categoryIconKeySchema,
    posOrder: z.coerce
      .number({ invalid_type_error: "POS sequence must be a valid integer" })
      .int("POS sequence must be a whole number")
      .min(1, "POS sequence starts at 1")
      .max(99, "POS sequence cannot exceed 99"),
    status: categoryStatusSchema,
    appliesToAllStores: z.boolean(),
    storeIds: z.array(z.string()),
  })
  .refine((values) => values.appliesToAllStores || values.storeIds.length > 0, {
    message: "Select at least one store when not applying to all stores",
    path: ["storeIds"],
  });

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
