import { apiRequest } from "@/lib/api/client";
import type { WorkspaceSettings } from "@/features/settings/types/settings.types";
import type { WorkspaceSettingsFormValues } from "@/features/settings/schemas/settings.schema";

export const settingsApi = {
  getSettings(): Promise<WorkspaceSettings> {
    return apiRequest<WorkspaceSettings>("/settings", {
      method: "GET",
    });
  },

  updateSettings(
    payload: Partial<WorkspaceSettingsFormValues>,
  ): Promise<WorkspaceSettings> {
    return apiRequest<WorkspaceSettings, Partial<WorkspaceSettingsFormValues>>(
      "/settings",
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  resetMockDataset(): Promise<WorkspaceSettings> {
    return apiRequest<WorkspaceSettings>("/settings/reset-mock-data", {
      method: "POST",
    });
  },
};
