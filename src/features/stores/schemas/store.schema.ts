import { z } from "zod";
import { StoreStatus } from "../constants/store.constant";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODE_REGEX = /^[A-Z0-9_-]+$/;

export function createStoreFormSchema(messages: {
  required: string;
  maxName: string;
  maxSlug: string;
  invalidSlug: string;
  maxCode: string;
  invalidCode: string;
  maxAddress: string;
  maxCityStateZip: string;
  maxPhone: string;
  maxEmail: string;
  invalidEmail: string;
  nonNegativeTax: string;
  maxDescription: string;
}) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(150, messages.maxName),
    slug: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(160, messages.maxSlug)
      .regex(SLUG_REGEX, messages.invalidSlug),
    code: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(50, messages.maxCode)
      .regex(CODE_REGEX, messages.invalidCode),
    address: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(255, messages.maxAddress),
    cityStateZip: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(255, messages.maxCityStateZip),
    phone: z
      .string()
      .trim()
      .max(50, messages.maxPhone)
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .max(100, messages.maxEmail)
      .refine(
        (val) => val === "" || z.string().email().safeParse(val).success,
        messages.invalidEmail,
      )
      .optional()
      .or(z.literal("")),
    taxRate: z.coerce
      .number({ invalid_type_error: messages.required })
      .finite(messages.nonNegativeTax)
      .min(0, messages.nonNegativeTax),
    description: z
      .string()
      .trim()
      .max(500, messages.maxDescription)
      .optional()
      .or(z.literal("")),
    status: z.nativeEnum(StoreStatus),
  });
}

export type StoreFormValues = z.infer<ReturnType<typeof createStoreFormSchema>>;
