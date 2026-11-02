import { z } from "zod";

export const storeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export const storeFormatSchema = z.enum([
  "FLAGSHIP",
  "MALL",
  "OUTLET",
  "POPUP",
]);

export const storeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(80, "Store name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(3, "Store code is required (e.g. #STR-05)")
    .max(16, "Store code cannot exceed 16 characters")
    .regex(
      /^#?[A-Z0-9-]+$/i,
      "Code may only contain letters, numbers, hyphens, and optional leading #",
    ),
  format: storeFormatSchema,
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(5, "Street address is required")
    .max(150, "Street address cannot exceed 150 characters"),
  cityStateZip: z
    .string()
    .trim()
    .min(4, "City, state, and postal code are required")
    .max(100, "Location cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid store contact email")
    .optional()
    .or(z.literal("")),
  managerName: z
    .string()
    .trim()
    .min(2, "Primary manager name is required")
    .max(80, "Manager name cannot exceed 80 characters"),
  managerEmail: z.string().trim().email("Enter a valid manager email address"),
  taxRate: z.coerce
    .number({ invalid_type_error: "Tax rate must be a valid percentage" })
    .min(0, "Tax rate cannot be negative")
    .max(25, "Tax rate cannot exceed 25%"),
  status: storeStatusSchema,
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
