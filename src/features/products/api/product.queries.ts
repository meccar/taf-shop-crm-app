import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { queryKeys } from "@/lib/query/query-keys";
import {
  ProductFormValues,
  AdjustStockValues,
} from "../schemas/product.schema";
import { ProductQueryParams } from "../types/product.type";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustProductStock,
  deleteProduct,
} from "./product.api";

export function useProductsListQuery(
  params: ProductQueryParams,
  enabled = true,
) {
  const activeStoreId = useActiveStoreId();

  return useQuery({
    queryKey: queryKeys.products.list(activeStoreId, { ...params }),
    queryFn: () => listProducts(params),
    enabled: enabled && Boolean(activeStoreId),
  });
}

export function useProductDetailQuery(id: string, enabled = true) {
  const activeStoreId = useActiveStoreId();

  return useQuery({
    queryKey: queryKeys.products.detail(activeStoreId, id),
    queryFn: () => getProduct(id),
    enabled: enabled && Boolean(activeStoreId) && Boolean(id),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      storeId,
    }: {
      values: ProductFormValues;
      storeId?: string;
    }) => createProduct(values, storeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useAdjustProductStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: AdjustStockValues }) =>
      adjustProductStock(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}
