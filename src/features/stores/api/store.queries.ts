"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/features/stores/api/store.api";
import type { StoreFilters } from "@/features/stores/types/store.types";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";
import {
  categoryKeys,
  dashboardKeys,
  productKeys,
  storeKeys,
} from "@/lib/query/query-keys";

export function useStores(filters: StoreFilters) {
  return useQuery({
    queryKey: storeKeys.list(filters),
    queryFn: () => storeApi.getStores(filters),
  });
}

export function useStore(storeId: string) {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => storeApi.getStoreById(storeId),
    enabled: Boolean(storeId),
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreFormValues) => storeApi.createStore(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: string;
      payload: Partial<StoreFormValues>;
    }) => storeApi.updateStore(storeId, payload),
    onSuccess: (updatedStore) => {
      queryClient.setQueryData(
        storeKeys.detail(updatedStore.data.id),
        updatedStore,
      );
      void queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => storeApi.deleteStore(storeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
