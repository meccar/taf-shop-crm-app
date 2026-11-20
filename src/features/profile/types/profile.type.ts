import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
