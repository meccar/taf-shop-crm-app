import { apiRequest } from "@/lib/api/client";
import type {
  ActivityLogItem,
  DashboardSummary,
} from "@/features/dashboard/types/dashboard.types";
import { ApiResponse } from "@/types/common.type";

export const dashboardApi = {
  getSummary(storeId: string): Promise<ApiResponse<DashboardSummary>> {
    return apiRequest<ApiResponse<DashboardSummary>>("/dashboard/summary", {
      method: "GET",
      params: { storeId },
    });
  },

  getActivityLogs(): Promise<ApiResponse<ActivityLogItem[]>> {
    return apiRequest<ApiResponse<ActivityLogItem[]>>("/dashboard/activity", {
      method: "GET",
    });
  },
};
