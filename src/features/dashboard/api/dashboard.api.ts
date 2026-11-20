import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  dashboardOverviewSchema,
  type DashboardOverview,
} from "../types/dashboard.type";
import {
  getMockDashboardOverview,
  isDashboardOverviewMockEnabled,
} from "../mocks/dashboard.mock";

export async function getDashboardOverview(): Promise<{
  data: DashboardOverview | null;
  isMocked: boolean;
}> {
  try {
    const data = await apiRequest<DashboardOverview>("/dashboard/overview", {
      method: "GET",
      schema: dashboardOverviewSchema,
    });
    return { data, isMocked: false };
  } catch (err) {
    if (
      isDashboardOverviewMockEnabled() &&
      err instanceof ApiError &&
      (err.statusCode === 404 || err.statusCode === 501)
    ) {
      return { data: getMockDashboardOverview(), isMocked: true };
    }
    return { data: null, isMocked: false };
  }
}
