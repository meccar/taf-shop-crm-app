import { apiRequest } from "@/lib/api/client";
import type {
  Product,
  ProductFilters,
  ProductsListResponse,
} from "@/features/products/types/product.types";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";

export const productApi = {
  getProducts(filters: ProductFilters): Promise<ProductsListResponse> {
    return apiRequest<ProductsListResponse>("/products", {
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

  getProductById(productId: string): Promise<Product> {
    return apiRequest<Product>(`/products/${encodeURIComponent(productId)}`, {
      method: "GET",
    });
  },

  createProduct(payload: ProductFormValues): Promise<Product> {
    return apiRequest<Product, ProductFormValues>("/products", {
      method: "POST",
      body: payload,
    });
  },

  updateProduct(
    productId: string,
    payload: Partial<ProductFormValues>,
  ): Promise<Product> {
    return apiRequest<Product, Partial<ProductFormValues>>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  deleteProduct(productId: string): Promise<{ deleted: boolean; id: string }> {
    return apiRequest<{ deleted: boolean; id: string }>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
