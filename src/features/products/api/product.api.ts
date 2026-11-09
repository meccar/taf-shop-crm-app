import { apiRequest } from "@/lib/api/client";
import type {
  Product,
  ProductFilters,
  ProductsListResponse,
} from "@/features/products/types/product.types";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";
import { ApiResponse } from "@/types/common.type";

export const productApi = {
  getProducts(
    filters: ProductFilters,
  ): Promise<ApiResponse<ProductsListResponse>> {
    return apiRequest<ApiResponse<ProductsListResponse>>("/products", {
      method: "GET",
      params: {
        storeId: filters.storeId,
        search: filters.search,
        categoryId: filters.categoryId,
        status: filters.status,
        stockHealth: filters.stockHealth,
        sortBy: filters.sortBy ?? "updatedAt",
        sortOrder: filters.sortOrder ?? "desc",
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
    });
  },

  getProductById(productId: string): Promise<ApiResponse<Product>> {
    return apiRequest<ApiResponse<Product>>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "GET",
      },
    );
  },

  createProduct(payload: ProductFormValues): Promise<ApiResponse<Product>> {
    return apiRequest<ApiResponse<Product>, ProductFormValues>("/products", {
      method: "POST",
      body: payload,
    });
  },

  updateProduct(
    productId: string,
    payload: Partial<ProductFormValues>,
  ): Promise<ApiResponse<Product>> {
    return apiRequest<ApiResponse<Product>, Partial<ProductFormValues>>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  deleteProduct(
    productId: string,
  ): Promise<ApiResponse<{ deleted: boolean; id: string }>> {
    return apiRequest<ApiResponse<{ deleted: boolean; id: string }>>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
