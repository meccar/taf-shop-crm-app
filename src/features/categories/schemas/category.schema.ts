import { z } from "zod";
import { CategoryStatus } from "../constants/categories.constant";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createCategoryFormSchema(messages: {
  required: string;
  maxName: string;
  maxSlug: string;
  invalidSlug: string;
}) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(120, messages.maxName),
    slug: z
      .string()
      .trim()
      .min(1, messages.required)
      .max(140, messages.maxSlug)
      .regex(SLUG_REGEX, messages.invalidSlug),
    description: z.string().trim().optional().or(z.literal("")),
    parentId: z.string().trim().nullable().optional().or(z.literal("")),
    status: z.nativeEnum(CategoryStatus),
  });
}

export type CategoryFormValues = z.infer<
  ReturnType<typeof createCategoryFormSchema>
>;
