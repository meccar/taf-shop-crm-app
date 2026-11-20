import { z } from "zod";

export function createLoginSchema(messages: {
  invalidEmail: string;
  passwordRequired: string;
}) {
  return z.object({
    email: z.string().trim().email(messages.invalidEmail),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
