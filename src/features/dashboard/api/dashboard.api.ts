import { apiRequest } from "@/lib/api/client";
import type {
  ActivityLogItem,
  DashboardSummary,
} from "@/features/dashboard/types/dashboard.types";

export const dashboardApi = {
  getSummary(storeId: string): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>("/dashboard/summary", {
      method: "GET",
      params: { storeId },
    });
  },

  getActivityLogs(): Promise<ActivityLogItem[]> {
    return apiRequest<ActivityLogItem[]>("/dashboard/activity", {
      method: "GET",
    });
  },
};
