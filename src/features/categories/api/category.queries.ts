"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/features/categories/api/category.api";
import type { CategoryFilters } from "@/features/categories/types/category.types";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import {
  categoryKeys,
  dashboardKeys,
  productKeys,
} from "@/lib/query/query-keys";

export function useCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryApi.getCategories(filters),
  });
}

export function useCategory(categoryId: string, storeId?: string) {
  return useQuery({
    queryKey: [...categoryKeys.detail(categoryId), storeId ?? "all"],
    queryFn: () => categoryApi.getCategoryById(categoryId, storeId),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryFormValues) =>
      categoryApi.createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: Partial<CategoryFormValues>;
    }) => categoryApi.updateCategory(categoryId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      categoryApi.reorderCategories(orderedIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.activity(),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.deleteCategory(categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
