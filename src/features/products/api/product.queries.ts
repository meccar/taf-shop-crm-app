"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/features/products/api/product.api";
import type { ProductFilters } from "@/features/products/types/product.types";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";
import {
  categoryKeys,
  dashboardKeys,
  productKeys,
  storeKeys,
} from "@/lib/query/query-keys";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
    enabled: Boolean(filters.storeId),
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productApi.getProductById(productId),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductFormValues) =>
      productApi.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: Partial<ProductFormValues>;
    }) => productApi.updateProduct(productId, payload),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct,
      );
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productApi.deleteProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
