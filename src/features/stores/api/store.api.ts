import { apiRequest, type BlobResponse } from "@/lib/api/client";
import { ExportFormat } from "../constants/store.constant";
import { StoreFormValues } from "../schemas/store.schema";
import {
  StoreQueryParams,
  StoreListResponse,
  storeListResponseSchema,
  Store,
  storeSchema,
  StoreMetrics,
  storeMetricsSchema,
} from "../types/store.types";

export async function listStores(
  params: StoreQueryParams = {},
): Promise<StoreListResponse> {
  return apiRequest<StoreListResponse>("/stores", {
    method: "GET",
    includeStoreHeader: false,
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    schema: storeListResponseSchema,
  });
}

export async function getStore(id: string): Promise<Store> {
  return apiRequest<Store>(`/stores/${encodeURIComponent(id)}`, {
    method: "GET",
    includeStoreHeader: false,
    schema: storeSchema,
  });
}

export async function createStore(values: StoreFormValues): Promise<Store> {
  return apiRequest<Store>("/stores", {
    method: "POST",
    includeStoreHeader: false,
    body: {
      name: values.name,
      slug: values.slug,
      code: values.code,
      address: values.address,
      cityStateZip: values.cityStateZip,
      phone: values.phone === "" ? undefined : values.phone,
      email: values.email === "" ? undefined : values.email,
      taxRate: values.taxRate,
      description: values.description === "" ? undefined : values.description,
      status: values.status,
    },
    schema: storeSchema,
  });
}

export async function updateStore(
  id: string,
  values: Partial<StoreFormValues>,
): Promise<Store> {
  return apiRequest<Store>(`/stores/${encodeURIComponent(id)}`, {
    method: "PATCH",
    includeStoreHeader: false,
    body: {
      ...values,
      phone:
        values.phone === undefined
          ? undefined
          : values.phone === ""
            ? null
            : values.phone,
      email:
        values.email === undefined
          ? undefined
          : values.email === ""
            ? null
            : values.email,
      description:
        values.description === undefined
          ? undefined
          : values.description === ""
            ? null
            : values.description,
    },
    schema: storeSchema,
  });
}

export async function deleteStore(id: string): Promise<void> {
  await apiRequest<unknown>(`/stores/${encodeURIComponent(id)}`, {
    method: "DELETE",
    includeStoreHeader: false,
  });
}

export async function exportStores(params: {
  format: ExportFormat;
  lang?: string;
  query?: StoreQueryParams;
}): Promise<BlobResponse> {
  return apiRequest<BlobResponse>("/stores/export", {
    method: "GET",
    includeStoreHeader: false,
    responseType: "blob",
    query: {
      format: params.format,
      lang: params.lang,
      search: params.query?.search,
      status: params.query?.status,
      sortBy: params.query?.sortBy,
      sortOrder: params.query?.sortOrder,
    },
  });
}

export async function getStoreMetrics(): Promise<{
  data: StoreMetrics | null;
  isMocked: boolean;
}> {
  try {
    const data = await apiRequest<StoreMetrics>("/stores/metrics", {
      method: "GET",
      includeStoreHeader: false,
      schema: storeMetricsSchema,
    });
    return { data, isMocked: false };
  } catch {
    return { data: null, isMocked: false };
  }
}
