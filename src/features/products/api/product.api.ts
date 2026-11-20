import { apiRequest } from "@/lib/api/client";
import {
  ProductFormValues,
  AdjustStockValues,
} from "../schemas/product.schema";
import {
  ProductQueryParams,
  ProductListResponse,
  productListResponseSchema,
  Product,
  productSchema,
} from "../types/product.type";

function entriesToMetadata(
  entries: Array<{ key: string; value: string }>,
): Record<string, string> | undefined {
  const record: Record<string, string> = {};
  for (const entry of entries) {
    const k = entry.key.trim();
    if (!k) continue;
    record[k] = entry.value.trim();
  }
  return Object.keys(record).length > 0 ? record : undefined;
}

export async function listProducts(
  params: ProductQueryParams = {},
): Promise<ProductListResponse> {
  return apiRequest<ProductListResponse>("/products", {
    method: "GET",
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      categoryId: params.categoryId,
      status: params.status,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      lowStockOnly: params.lowStockOnly,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    schema: productListResponseSchema,
  });
}

export async function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "GET",
    schema: productSchema,
  });
}

export async function getProductBySku(sku: string): Promise<Product> {
  return apiRequest<Product>(`/products/sku/${encodeURIComponent(sku)}`, {
    method: "GET",
    schema: productSchema,
  });
}

export async function createProduct(
  values: ProductFormValues,
  storeId?: string,
): Promise<Product> {
  return apiRequest<Product>("/products", {
    method: "POST",
    headers: storeId ? { "x-store-id": storeId } : undefined,
    body: {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      description: values.description === "" ? undefined : values.description,
      price: values.price,
      costPrice: values.costPrice === "" ? undefined : values.costPrice,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      status: values.status,
      categoryId: values.categoryId,
      images: values.images,
      metadata: entriesToMetadata(values.metadataEntries),
    },
    schema: productSchema,
  });
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      description: values.description === "" ? undefined : values.description,
      price: values.price,
      costPrice: values.costPrice === "" ? null : values.costPrice,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      status: values.status,
      categoryId: values.categoryId,
      images: values.images,
      metadata: entriesToMetadata(values.metadataEntries) ?? null,
    },
    schema: productSchema,
  });
}

export async function adjustProductStock(
  id: string,
  values: AdjustStockValues,
): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}/stock`, {
    method: "PATCH",
    body: {
      delta: values.delta,
    },
    schema: productSchema,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest<unknown>(`/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
