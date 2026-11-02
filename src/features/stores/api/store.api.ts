import { apiRequest } from "@/lib/api/client";
import type {
  Store,
  StoreFilters,
  StoresListResponse,
} from "@/features/stores/types/store.types";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";

export const storeApi = {
  getStores(filters: StoreFilters = {}): Promise<StoresListResponse> {
    return apiRequest<StoresListResponse>("/stores", {
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

  getStoreById(storeId: string): Promise<Store> {
    return apiRequest<Store>(`/stores/${encodeURIComponent(storeId)}`, {
      method: "GET",
    });
  },

  createStore(payload: StoreFormValues): Promise<Store> {
    return apiRequest<Store, StoreFormValues>("/stores", {
      method: "POST",
      body: payload,
    });
  },

  updateStore(
    storeId: string,
    payload: Partial<StoreFormValues>,
  ): Promise<Store> {
    return apiRequest<Store, Partial<StoreFormValues>>(
      `/stores/${encodeURIComponent(storeId)}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  deleteStore(storeId: string): Promise<{ deleted: boolean; id: string }> {
    return apiRequest<{ deleted: boolean; id: string }>(
      `/stores/${encodeURIComponent(storeId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
