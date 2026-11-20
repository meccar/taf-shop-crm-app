import { apiRequest } from "@/lib/api/client";
import { CategoryFormValues } from "../schemas/category.schema";
import {
  CategoryQueryParams,
  CategoryListResponse,
  categoryListResponseSchema,
  Category,
  categorySchema,
} from "../types/category.type";

export async function listCategories(
  params: CategoryQueryParams = {},
): Promise<CategoryListResponse> {
  return apiRequest<CategoryListResponse>("/categories", {
    method: "GET",
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      parentId: params.parentId,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    schema: categoryListResponseSchema,
  });
}

export async function getCategory(id: string): Promise<Category> {
  return apiRequest<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: "GET",
    schema: categorySchema,
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiRequest<Category>(`/categories/slug/${encodeURIComponent(slug)}`, {
    method: "GET",
    schema: categorySchema,
  });
}

export async function createCategory(
  values: CategoryFormValues,
): Promise<Category> {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: {
      name: values.name,
      slug: values.slug,
      description: values.description === "" ? undefined : values.description,
      parentId:
        values.parentId === "" || values.parentId === null
          ? undefined
          : values.parentId,
      status: values.status,
    },
    schema: categorySchema,
  });
}

export async function updateCategory(
  id: string,
  values: Partial<CategoryFormValues>,
): Promise<Category> {
  return apiRequest<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      ...values,
      description: values.description === "" ? undefined : values.description,
      parentId: values.parentId === "" ? null : values.parentId,
    },
    schema: categorySchema,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<unknown>(`/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
