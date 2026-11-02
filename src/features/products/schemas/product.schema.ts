import { z } from "zod";

export const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);

export const productFormSchema = z.object({
  storeId: z.string().min(1, "Store context is required"),
  categoryId: z.string().min(1, "Select an assigned product category"),
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(120, "Product name cannot exceed 120 characters"),
  sku: z
    .string()
    .trim()
    .min(3, "SKU is required (minimum 3 characters)")
    .max(32, "SKU cannot exceed 32 characters")
    .regex(
      /^[A-Z0-9-]+$/i,
      "SKU may only contain alphanumeric characters and hyphens",
    ),
  description: z
    .string()
    .trim()
    .max(600, "Description cannot exceed 600 characters")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({ invalid_type_error: "Enter a valid unit price" })
    .min(0.01, "Price must be at least $0.01")
    .max(999999.99, "Price exceeds maximum allowed value"),
  stockQuantity: z.coerce
    .number({ invalid_type_error: "Stock quantity must be a whole number" })
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .max(100000, "Stock quantity cannot exceed 100,000"),
  lowStockThreshold: z.coerce
    .number({
      invalid_type_error: "Low-stock threshold must be a whole number",
    })
    .int("Threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .max(10000, "Threshold cannot exceed 10,000"),
  status: productStatusSchema,
  imageUrl: z
    .string()
    .trim()
    .max(2000000, "Image payload exceeds allowed size")
    .optional()
    .or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
