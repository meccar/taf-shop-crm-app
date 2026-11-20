import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getActiveStoreId, setActiveStoreId } from "@/lib/api/store-context";
import { login, logout } from "../api/auth.api";
import { listStores } from "@/features/stores/api/store.api";
import { StoreStatus } from "@/features/stores/constants/store.constant";
import { LoginFormValues } from "../schemas/auth.schema";

export async function ensureDefaultActiveStore(): Promise<void> {
  const existing = getActiveStoreId();
  const storesPage = await listStores({ page: 1, limit: 50 });
  const items = storesPage.items;

  if (existing && items.some((store) => store.id === existing)) {
    return;
  }

  const preferred =
    items.find((store) => store.status === StoreStatus.ACTIVE) ??
    items[0] ??
    null;
  setActiveStoreId(preferred ? preferred.id : null);
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await login(values);
      await ensureDefaultActiveStore().catch(() => undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
    },
  });
}
