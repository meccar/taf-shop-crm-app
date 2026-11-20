"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveStoreId } from "@/lib/api/store-context";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { queryKeys } from "@/lib/query/query-keys";
import { cn } from "@/lib/utils";
import { useStoresListQuery } from "@/features/stores/api/store.queries";
import { StoreStatus } from "@/features/stores/constants/store.constant";
import { Button } from "../ui/button";

export function StoreSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const t = useTranslations("common.shell");
  const queryClient = useQueryClient();
  const activeStoreId = useActiveStoreId();
  const { data } = useStoresListQuery({ page: 1, limit: 100 });

  const stores = data?.items ?? [];
  const activeStore =
    stores.find((store) => store.id === activeStoreId) ?? null;

  const handleSelectStore = async (storeId: string, storeName: string) => {
    if (storeId === activeStoreId) return;
    setActiveStoreId(storeId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
    toast.success(t("switchingStore", { name: storeName }));
  };

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              title={activeStore?.name ?? t("selectStore")}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas text-navy hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <StoreIcon className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent side="right" align="start" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("activeStore")}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {stores.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted">
              {t("noStores")}
            </div>
          ) : (
            stores.map((store) => (
              <DropdownMenuItem
                key={store.id}
                onClick={() => handleSelectStore(store.id, store.name)}
                className="justify-between"
              >
                <span className="truncate font-medium">{store.name}</span>
                <span className="font-mono text-xs text-muted">
                  {store.code}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-canvas p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t("activeStore")}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action cursor-pointer"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    activeStore?.status === StoreStatus.ACTIVE
                      ? "bg-success"
                      : "bg-muted",
                  )}
                />
                <span className="truncate font-medium text-ink">
                  {activeStore ? activeStore.name : t("selectStore")}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-[224px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("activeStore")}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {stores.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted">
              {t("noStores")}
            </div>
          ) : (
            stores.map((store) => {
              const isSelected = store.id === activeStoreId;
              return (
                <DropdownMenuItem
                  key={store.id}
                  onClick={() => handleSelectStore(store.id, store.name)}
                  className={cn(
                    "flex items-center justify-between gap-2",
                    isSelected && "bg-surface-selected text-action",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{store.name}</p>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {store.code}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
