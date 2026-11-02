import { z } from "zod";

export const workspaceSettingsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Organization name cannot exceed 100 characters"),
  primaryContactEmail: z
    .string()
    .trim()
    .email("Enter a valid operational contact email"),
  clusterRegion: z.enum(["US-EAST", "US-WEST", "EU-CENTRAL", "AP-SOUTHEAST"]),
  defaultTaxRate: z.coerce
    .number()
    .min(0, "Default tax rate cannot be negative")
    .max(25, "Default tax rate cannot exceed 25%"),
  defaultLowStockThreshold: z.coerce
    .number()
    .int("Threshold must be a whole number")
    .min(1, "Threshold must be at least 1 unit")
    .max(1000, "Threshold cannot exceed 1,000 units"),
  posAutoSyncEnabled: z.boolean(),
  enforceUniqueSkuPerStore: z.boolean(),
});

export type WorkspaceSettingsFormValues = z.infer<
  typeof workspaceSettingsSchema
>;
