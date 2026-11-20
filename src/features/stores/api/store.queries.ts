import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { ExportFormat } from "../constants/store.constant";
import { StoreFormValues } from "../schemas/store.schema";
import { StoreQueryParams } from "../types/store.types";
import {
  listStores,
  getStore,
  getStoreMetrics,
  createStore,
  updateStore,
  deleteStore,
  exportStores,
} from "./store.api";

export function useStoresListQuery(params: StoreQueryParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stores.list({ ...params }),
    queryFn: () => listStores(params),
    enabled,
  });
}

export function useStoreDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stores.detail(id),
    queryFn: () => getStore(id),
    enabled: enabled && Boolean(id),
  });
}

export function useStoreMetricsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.stores.metrics(),
    queryFn: getStoreMetrics,
    enabled,
  });
}

export function useCreateStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: StoreFormValues) => createStore(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stores.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useUpdateStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<StoreFormValues>;
    }) => updateStore(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stores.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useDeleteStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stores.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useExportStoresMutation() {
  return useMutation({
    mutationFn: (params: {
      format: ExportFormat;
      lang?: string;
      query?: StoreQueryParams;
    }) => exportStores(params),
  });
}
