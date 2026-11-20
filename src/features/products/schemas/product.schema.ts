import { z } from "zod";
import { ProductStatus } from "../constants/product.constant";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasAtMostTwoDecimals(val: number): boolean {
  return Math.round(val * 100) === val * 100;
}

export function createProductFormSchema(messages: {
  required: string;
  maxSku: string;
  maxName: string;
  maxSlug: string;
  invalidSlug: string;
  positivePrice: string;
  nonNegativeCost: string;
  nonNegativeInt: string;
  integer: string;
  maxDecimals: string;
  activeRequiresStock: string;
  deltaNonZero: string;
}) {
  return z
    .object({
      sku: z.string().trim().min(1, messages.required).max(64, messages.maxSku),
      name: z
        .string()
        .trim()
        .min(1, messages.required)
        .max(200, messages.maxName),
      slug: z
        .string()
        .trim()
        .min(1, messages.required)
        .max(220, messages.maxSlug)
        .regex(SLUG_REGEX, messages.invalidSlug),
      description: z.string().trim().optional().or(z.literal("")),
      price: z.coerce
        .number()
        .finite()
        .positive(messages.positivePrice)
        .refine(hasAtMostTwoDecimals, messages.maxDecimals),
      costPrice: z.union([
        z.literal(""),
        z.coerce
          .number()
          .finite()
          .min(0, messages.nonNegativeCost)
          .refine(hasAtMostTwoDecimals, messages.maxDecimals),
      ]),
      stockQuantity: z.coerce
        .number()
        .int(messages.integer)
        .min(0, messages.nonNegativeInt),
      lowStockThreshold: z.coerce
        .number()
        .int(messages.integer)
        .min(0, messages.nonNegativeInt),
      status: z.nativeEnum(ProductStatus),
      categoryId: z.string().trim().min(1, messages.required),
      images: z.array(z.string()),
      metadataEntries: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      if (data.status === ProductStatus.ACTIVE && data.stockQuantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stockQuantity"],
          message: messages.activeRequiresStock,
        });
      }
    });
}

export type ProductFormValues = z.infer<
  ReturnType<typeof createProductFormSchema>
>;

export function createAdjustStockSchema(messages: {
  integer: string;
  deltaNonZero: string;
}) {
  return z.object({
    delta: z.coerce
      .number()
      .int(messages.integer)
      .refine((val) => val !== 0, messages.deltaNonZero),
  });
}

export type AdjustStockValues = z.infer<
  ReturnType<typeof createAdjustStockSchema>
>;
