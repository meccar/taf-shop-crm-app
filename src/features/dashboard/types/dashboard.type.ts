import { z } from "zod";

export const dashboardActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["STORE_CREATED", "PRODUCT_UPDATED", "STOCK_LOW"]),
  title: z.string(),
  timestamp: z.string(),
});

export const dashboardOverviewSchema = z.object({
  storesTotal: z.number(),
  storesActive: z.number(),
  categoriesTotal: z.number(),
  productsTotal: z.number(),
  lowStockCount: z.number(),
  recentActivity: z.array(dashboardActivitySchema).default([]),
});

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
