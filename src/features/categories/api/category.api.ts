import { apiRequest } from "@/lib/api/client";
import type {
  CategoriesListResponse,
  Category,
  CategoryFilters,
} from "@/features/categories/types/category.types";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import { ApiResponse } from "@/types/common.type";

export const categoryApi = {
  getCategories(
    filters: CategoryFilters = {},
  ): Promise<ApiResponse<CategoriesListResponse>> {
    return apiRequest<ApiResponse<CategoriesListResponse>>("/categories", {
      method: "GET",
      params: {
        search: filters.search,
        occupancy: filters.occupancy ?? "ALL",
        storeId: filters.storeId,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 25,
      },
    });
  },

  getCategoryById(
    categoryId: string,
    storeId?: string,
  ): Promise<ApiResponse<Category>> {
    return apiRequest<ApiResponse<Category>>(
      `/categories/${encodeURIComponent(categoryId)}`,
      {
        method: "GET",
        params: { storeId },
      },
    );
  },

  createCategory(payload: CategoryFormValues): Promise<ApiResponse<Category>> {
    return apiRequest<ApiResponse<Category>, CategoryFormValues>(
      "/categories",
      {
        method: "POST",
        body: payload,
      },
    );
  },

  updateCategory(
    categoryId: string,
    payload: Partial<CategoryFormValues>,
  ): Promise<ApiResponse<Category>> {
    return apiRequest<ApiResponse<Category>, Partial<CategoryFormValues>>(
      `/categories/${encodeURIComponent(categoryId)}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  reorderCategories(orderedIds: string[]): Promise<ApiResponse<Category[]>> {
    return apiRequest<ApiResponse<Category[]>, { orderedIds: string[] }>(
      "/categories/reorder",
      {
        method: "PATCH",
        body: { orderedIds },
      },
    );
  },

  deleteCategory(
    categoryId: string,
  ): Promise<ApiResponse<{ deleted: boolean; id: string }>> {
    return apiRequest<ApiResponse<{ deleted: boolean; id: string }>>(
      `/categories/${encodeURIComponent(categoryId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
