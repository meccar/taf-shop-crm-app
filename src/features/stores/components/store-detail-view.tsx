"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { StoreStatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setActiveStoreId } from "@/lib/api/store-context";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDateTime, formatNumber } from "@/lib/i18n/formatters";
import { queryKeys } from "@/lib/query/query-keys";
import { useStoreDetailQuery } from "../api/store.queries";
import { StoreStatus } from "../constants/store.constant";
import { StoreStatusDialog, StoreDeleteDialog } from "./store-dialog";

export function StoreDetailView({ storeId }: { storeId: string }) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const queryClient = useQueryClient();
  const activeStoreId = useActiveStoreId();

  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<
    StoreStatus.ACTIVE | StoreStatus.INACTIVE | null
  >(null);

  const detailQuery = useStoreDetailQuery(storeId);

  if (detailQuery.isLoading) {
    return <TableSkeleton rows={4} columns={3} />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ErrorState
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const store = detailQuery.data;
  const isCurrent = store.id === activeStoreId;

  const handleSetActive = async () => {
    setActiveStoreId(store.id);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
    toast.success(tCommon("shell.switchingStore", { name: store.name }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            render={
              <Link href="/stores">
                <ArrowLeft className="h-4 w-4" />
                <span>{tCommon("actions.back")}</span>
              </Link>
            }
            variant="ghost"
            size="sm"
            className="-ml-2"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {store.name}
            </h1>
            <Badge variant="store" className="font-mono">
              {store.code}
            </Badge>
            <StoreStatusBadge status={store.status} />
          </div>
          <p className="font-mono text-xs text-muted">/{store.slug}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isCurrent ? (
            <Button type="button" variant="outline" onClick={handleSetActive}>
              {tStores("switchContext")}
            </Button>
          ) : (
            <Badge variant="action">{tStores("activeContextBadge")}</Badge>
          )}
          <Button
            render={
              <Link href={`/stores/${store.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span>{tCommon("actions.edit")}</span>
              </Link>
            }
            variant="outline"
          />
          {store.status === StoreStatus.ACTIVE ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusTarget(StoreStatus.INACTIVE)}
            >
              <PauseCircle className="h-4 w-4 text-warning" />
              <span>{tCommon("actions.deactivate")}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusTarget(StoreStatus.ACTIVE)}
            >
              <PlayCircle className="h-4 w-4 text-success" />
              <span>{tCommon("actions.activate")}</span>
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>{tCommon("actions.delete")}</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tStores("viewStore")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.address")}
            </p>
            <p className="mt-1 text-sm text-ink">{store.address}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.cityStateZip")}
            </p>
            <p className="mt-1 text-sm text-ink">{store.cityStateZip}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.taxRate")}
            </p>
            <p className="mt-1 font-mono text-sm text-ink tabular-nums">
              {formatNumber(store.taxRate, locale)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.phone")}
            </p>
            <p className="mt-1 text-sm text-ink">{store.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.email")}
            </p>
            <p className="mt-1 text-sm text-ink">{store.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              {tStores("fields.updatedAt")}
            </p>
            <p className="mt-1 text-sm text-ink tabular-nums">
              {formatDateTime(store.updatedAt, locale)}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-muted">
              {tStores("fields.description")}
            </p>
            <p className="mt-1 text-sm text-ink">{store.description || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <StoreStatusDialog
        store={statusTarget !== null ? store : null}
        targetStatus={statusTarget}
        onClose={() => setStatusTarget(null)}
      />

      <StoreDeleteDialog
        store={deleteOpen ? store : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.replace("/stores")}
      />
    </div>
  );
}
