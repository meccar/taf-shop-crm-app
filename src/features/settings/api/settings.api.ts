import { apiRequest } from "@/lib/api/client";
import type { WorkspaceSettings } from "@/features/settings/types/settings.types";
import type { WorkspaceSettingsFormValues } from "@/features/settings/schemas/settings.schema";
import { ApiResponse } from "@/types/common.type";

export const settingsApi = {
  getSettings(): Promise<ApiResponse<WorkspaceSettings>> {
    return apiRequest<ApiResponse<WorkspaceSettings>>("/settings", {
      method: "GET",
    });
  },

  updateSettings(
    payload: Partial<WorkspaceSettingsFormValues>,
  ): Promise<ApiResponse<WorkspaceSettings>> {
    return apiRequest<
      ApiResponse<WorkspaceSettings>,
      Partial<WorkspaceSettingsFormValues>
    >("/settings", {
      method: "PATCH",
      body: payload,
    });
  },

  resetMockDataset(): Promise<ApiResponse<WorkspaceSettings>> {
    return apiRequest<ApiResponse<WorkspaceSettings>>(
      "/settings/reset-mock-data",
      {
        method: "POST",
      },
    );
  },
};
