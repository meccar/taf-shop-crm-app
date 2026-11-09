import { apiRequest } from "@/lib/api/client";
import type {
  Store,
  StoreFilters,
  StoresListResponse,
} from "@/features/stores/types/store.types";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";
import { ApiResponse } from "@/types/common.type";

export const storeApi = {
  getStores(
    filters: StoreFilters = {},
  ): Promise<ApiResponse<StoresListResponse>> {
    return apiRequest<ApiResponse<StoresListResponse>>("/stores", {
      method: "GET",
      params: {
        search: filters.search,
        status: filters.status,
        format: filters.format,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
    });
  },

  getStoreById(storeId: string): Promise<ApiResponse<Store>> {
    return apiRequest<ApiResponse<Store>>(
      `/stores/${encodeURIComponent(storeId)}`,
      {
        method: "GET",
      },
    );
  },

  createStore(payload: StoreFormValues): Promise<ApiResponse<Store>> {
    return apiRequest<ApiResponse<Store>, StoreFormValues>("/stores", {
      method: "POST",
      body: payload,
    });
  },

  updateStore(
    storeId: string,
    payload: Partial<StoreFormValues>,
  ): Promise<ApiResponse<Store>> {
    return apiRequest<ApiResponse<Store>, Partial<StoreFormValues>>(
      `/stores/${encodeURIComponent(storeId)}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  deleteStore(
    storeId: string,
  ): Promise<ApiResponse<{ deleted: boolean; id: string }>> {
    return apiRequest<ApiResponse<{ deleted: boolean; id: string }>>(
      `/stores/${encodeURIComponent(storeId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
