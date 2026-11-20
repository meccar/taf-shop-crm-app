import { useQuery } from "@tanstack/react-query";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { queryKeys } from "@/lib/query/query-keys";
import { getDashboardOverview } from "../api/dashboard.api";

export function useDashboardOverviewQuery(enabled = true) {
  const activeStoreId = useActiveStoreId();

  return useQuery({
    queryKey: queryKeys.dashboard.overview(activeStoreId),
    queryFn: getDashboardOverview,
    enabled,
  });
}
