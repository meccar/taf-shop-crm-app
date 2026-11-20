import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { queryKeys } from "@/lib/query/query-keys";
import { CategoryFormValues } from "../schemas/category.schema";
import { CategoryQueryParams } from "../types/category.type";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.api";

export function useCategoriesListQuery(
  params: CategoryQueryParams,
  enabled = true,
) {
  const activeStoreId = useActiveStoreId();

  return useQuery({
    queryKey: queryKeys.categories.list(activeStoreId, { ...params }),
    queryFn: () => listCategories(params),
    enabled: enabled && Boolean(activeStoreId),
  });
}

export function useCategoryDetailQuery(id: string, enabled = true) {
  const activeStoreId = useActiveStoreId();

  return useQuery({
    queryKey: queryKeys.categories.detail(activeStoreId, id),
    queryFn: () => getCategory(id),
    enabled: enabled && Boolean(activeStoreId) && Boolean(id),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => createCategory(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<CategoryFormValues>;
    }) => updateCategory(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}
