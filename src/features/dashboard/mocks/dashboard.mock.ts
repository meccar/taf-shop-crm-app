import type { DashboardOverview } from "../types/dashboard.type";

export function isDashboardOverviewMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_DASHBOARD_OVERVIEW === "true";
}

export function getMockDashboardOverview(): DashboardOverview {
  return {
    storesTotal: 4,
    storesActive: 3,
    categoriesTotal: 12,
    productsTotal: 48,
    lowStockCount: 3,
    recentActivity: [
      {
        id: "preview-1",
        type: "PRODUCT_UPDATED",
        title: "Preview activity item (mock mode enabled)",
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
