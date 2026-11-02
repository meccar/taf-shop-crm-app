"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/api/dashboard.api";
import { dashboardKeys } from "@/lib/query/query-keys";

export function useDashboardSummary(storeId: string) {
  return useQuery({
    queryKey: dashboardKeys.summary(storeId),
    queryFn: () => dashboardApi.getSummary(storeId),
    enabled: Boolean(storeId),
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: () => dashboardApi.getActivityLogs(),
  });
}
