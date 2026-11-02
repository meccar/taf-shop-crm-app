"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/features/settings/api/settings.api";
import type { WorkspaceSettingsFormValues } from "@/features/settings/schemas/settings.schema";
import {
  categoryKeys,
  dashboardKeys,
  productKeys,
  settingsKeys,
  storeKeys,
} from "@/lib/query/query-keys";

export function useWorkspaceSettings() {
  return useQuery({
    queryKey: settingsKeys.workspace(),
    queryFn: () => settingsApi.getSettings(),
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<WorkspaceSettingsFormValues>) =>
      settingsApi.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.workspace(), updated);
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.activity(),
      });
    },
  });
}

export function useResetMockDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsApi.resetMockDataset(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
