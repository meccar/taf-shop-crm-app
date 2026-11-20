import { z } from "zod";

export const MAX_PRODUCT_IMAGES = 10;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const presignUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string().min(1),
  headers: z.record(z.string()).optional(),
});

export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>;

export const confirmUploadResponseSchema = z.object({
  key: z.string().min(1),
  url: z.string().optional(),
});

export type ConfirmUploadResponse = z.infer<typeof confirmUploadResponseSchema>;
