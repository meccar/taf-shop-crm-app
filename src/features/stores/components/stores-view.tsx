"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Edit,
  Eye,
  LayoutGrid,
  MapPin,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Store as StoreIcon,
  TableProperties,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StoreStatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileQuery } from "@/features/profile/api/profile.queries";
import { getErrorMessage } from "@/lib/api/errors";
import { setActiveStoreId } from "@/lib/api/store-context";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDateTime, formatNumber } from "@/lib/i18n/formatters";
import { queryKeys } from "@/lib/query/query-keys";
import { cn } from "@/lib/utils";
import {
  useStoresListQuery,
  useStoreMetricsQuery,
  useExportStoresMutation,
} from "../api/store.queries";
import {
  StoreStatus,
  StoreSortField,
  STORE_SORT_FIELDS,
  ExportFormat,
  EXPORT_FORMATS,
  STORE_STATUS_VALUES,
} from "../constants/store.constant";
import { Store, StoreQueryParams } from "../types/store.types";
import { StoreStatusDialog, StoreDeleteDialog } from "./store-dialog";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function StoresView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as AppLocale;
  const queryClient = useQueryClient();

  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "20") || 20),
  );
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const parsedStatus =
    statusParam !== null &&
    statusParam !== "" &&
    !Number.isNaN(Number(statusParam))
      ? (Number(statusParam) as StoreStatus)
      : undefined;
  const sortByParam = searchParams.get("sortBy");
  const sortBy: StoreSortField = (
    STORE_SORT_FIELDS as readonly string[]
  ).includes(sortByParam ?? "")
    ? (sortByParam as StoreSortField)
    : "createdAt";
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder: "asc" | "desc" = sortOrderParam === "asc" ? "asc" : "desc";
  const viewMode = searchParams.get("view") === "grid" ? "grid" : "table";

  const [searchInput, setSearchInput] = useState(search);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [statusDialogState, setStatusDialogState] = useState<{
    store: Store | null;
    targetStatus: StoreStatus.ACTIVE | StoreStatus.INACTIVE | null;
  }>({ store: null, targetStatus: null });

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const searchRef = useRef(search);
  searchRef.current = search;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParamsRef.current.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput.trim() !== searchRef.current) {
        updateParams({ search: searchInput.trim() || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, updateParams]);

  const queryParams: StoreQueryParams = {
    page,
    limit,
    search: search || undefined,
    status: parsedStatus,
    sortBy,
    sortOrder,
  };

  const activeStoreId = useActiveStoreId();
  const profileQuery = useProfileQuery();
  const storesQuery = useStoresListQuery(queryParams);
  const metricsQuery = useStoreMetricsQuery();
  const exportMutation = useExportStoresMutation();

  const handleSwitchStore = async (store: Store) => {
    if (store.id === activeStoreId) return;
    setActiveStoreId(store.id);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
    toast.success(tCommon("shell.switchingStore", { name: store.name }));
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      const { blob, filename } = await exportMutation.mutateAsync({
        format,
        lang: locale,
        query: queryParams,
      });
      triggerBlobDownload(blob, filename ?? `stores-export.${format}`);
      toast.success(tStores("export.success"));
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  const stores = storesQuery.data?.items ?? [];
  const meta = storesQuery.data?.meta;
  const metrics = metricsQuery.data?.data ?? null;
  const metricsIsMocked = metricsQuery.data?.isMocked ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {profileQuery.data?.customerId ? (
              <>
                <span className="font-mono font-medium text-action">
                  {tStores("tenantInstance", {
                    customerId: profileQuery.data.customerId,
                  })}
                </span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            {meta ? (
              <span className="tabular-nums">
                {tStores("locationsCount", { count: meta.total })}
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {tStores("title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted">{tStores("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4" />
                  <span>{tStores("export.button")}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {EXPORT_FORMATS.map((format) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => handleExport(format)}
                >
                  {tStores(`export.${format}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            nativeButton={false}
            render={
              <Link href="/stores/new">
                <Plus className="h-4 w-4" />
                <span>{tStores("createStore")}</span>
              </Link>
            }
          />
        </div>
      </div>

      {metrics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {tStores("metrics.totalStores")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                  {formatNumber(metrics.total, locale)}
                </p>
              </div>
              {metricsIsMocked ? (
                <Badge variant="warning">{tStores("metrics.mockTag")}</Badge>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {tStores("metrics.activeStores")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-success tabular-nums">
                  {formatNumber(metrics.byStatus.active, locale)}
                </p>
              </div>
              {metricsIsMocked ? (
                <Badge variant="warning">{tStores("metrics.mockTag")}</Badge>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {tStores("metrics.pendingInactive")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                  {formatNumber(
                    metrics.byStatus.pending + metrics.byStatus.inactive,
                    locale,
                  )}
                </p>
              </div>
              {metricsIsMocked ? (
                <Badge variant="warning">{tStores("metrics.mockTag")}</Badge>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {tStores("metrics.createdLast30Days")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                  {formatNumber(metrics.createdLast30Days, locale)}
                </p>
              </div>
              {metricsIsMocked ? (
                <Badge variant="warning">{tStores("metrics.mockTag")}</Badge>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={tStores("searchPlaceholder")}
                className="pl-9"
              />
            </div>

            <Select
              value={parsedStatus !== undefined ? String(parsedStatus) : "all"}
              onValueChange={(value) => {
                if (!value) return;
                updateParams({
                  status: value === "all" ? undefined : value,
                  page: 1,
                });
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tStores("allStatuses")}</SelectItem>
                {STORE_STATUS_VALUES.map((statusVal) => (
                  <SelectItem key={statusVal} value={String(statusVal)}>
                    {tStores(`status.${statusVal}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}:${sortOrder}`}
              onValueChange={(value) => {
                if (!value) return;

                const [nextSortBy, nextSortOrder] = value.split(":");
                updateParams({
                  sortBy: nextSortBy,
                  sortOrder: nextSortOrder,
                  page: 1,
                });
              }}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">
                  {tCommon("sort.createdAt")} ({tCommon("sort.desc")})
                </SelectItem>
                <SelectItem value="createdAt:asc">
                  {tCommon("sort.createdAt")} ({tCommon("sort.asc")})
                </SelectItem>
                <SelectItem value="updatedAt:desc">
                  {tCommon("sort.updatedAt")} ({tCommon("sort.desc")})
                </SelectItem>
                <SelectItem value="name:asc">
                  {tCommon("sort.name")} ({tCommon("sort.asc")})
                </SelectItem>
                <SelectItem value="slug:asc">
                  {tCommon("sort.slug")} ({tCommon("sort.asc")})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="inline-flex items-center rounded-lg border border-line bg-canvas p-0.5">
              <Button
                type="button"
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={tStores("viewTable")}
                onClick={() => updateParams({ view: undefined })}
                className={cn(
                  viewMode === "table" && "bg-surface text-action shadow-xs",
                )}
              >
                <TableProperties className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={tStores("viewGrid")}
                onClick={() => updateParams({ view: "grid" })}
                className={cn(
                  viewMode === "grid" && "bg-surface text-action shadow-xs",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {storesQuery.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : storesQuery.isError ? (
          <div className="p-4">
            <ErrorState
              error={storesQuery.error}
              onRetry={() => void storesQuery.refetch()}
            />
          </div>
        ) : stores.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={StoreIcon}
              title={tStores("empty.title")}
              description={tStores("empty.description")}
              action={
                <Button
                  nativeButton={false}
                  render={
                    <Link href="/stores/new">
                      <Plus className="h-4 w-4" />
                      <span>{tStores("createStore")}</span>
                    </Link>
                  }
                />
              }
            />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {stores.map((store) => {
              const isActiveContext = store.id === activeStoreId;
              return (
                <div
                  key={store.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 transition-colors",
                    isActiveContext
                      ? "border-action/40 bg-surface-selected/40"
                      : "border-line bg-surface hover:bg-canvas",
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            isActiveContext
                              ? "bg-action text-action-foreground"
                              : "bg-surface-subtle text-navy",
                          )}
                        >
                          <StoreIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/stores/${store.id}`}
                            className="block truncate font-semibold text-ink hover:text-action"
                          >
                            {store.name}
                          </Link>
                          <p className="font-mono text-xs text-muted">
                            {store.code}
                          </p>
                        </div>
                      </div>
                      <StoreStatusBadge status={store.status} />
                    </div>

                    <p className="flex items-start gap-1.5 text-sm text-muted">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-placeholder" />
                      <span>
                        {store.address}, {store.cityStateZip}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-xs text-muted tabular-nums">
                      {formatDateTime(store.updatedAt, locale)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={isActiveContext ? "secondary" : "outline"}
                        disabled={isActiveContext}
                        onClick={() => handleSwitchStore(store)}
                      >
                        {isActiveContext
                          ? tStores("currentContext")
                          : tStores("switchContext")}
                      </Button>
                      <Button
                        nativeButton={false}
                        render={
                          <Link href={`/stores/${store.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        }
                        variant="ghost"
                        size="icon-sm"
                        aria-label={tCommon("actions.edit")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tStores("columns.nameAndCode")}</TableHead>
                <TableHead>{tStores("columns.location")}</TableHead>
                <TableHead>{tStores("columns.status")}</TableHead>
                <TableHead className="text-right">
                  {tStores("columns.taxRate")}
                </TableHead>
                <TableHead>{tStores("columns.updatedAt")}</TableHead>
                <TableHead className="text-right">
                  {tStores("columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => {
                const isActiveContext = store.id === activeStoreId;
                return (
                  <TableRow key={store.id} data-selected={isActiveContext}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isActiveContext
                              ? "bg-action text-action-foreground"
                              : "bg-surface-subtle text-navy",
                          )}
                        >
                          <StoreIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/stores/${store.id}`}
                              className="truncate font-semibold text-ink hover:text-action"
                            >
                              {store.name}
                            </Link>
                            <Badge
                              variant="store"
                              className="font-mono text-[11px]"
                            >
                              {store.code}
                            </Badge>
                            {isActiveContext ? (
                              <Badge variant="action">
                                {tStores("activeContextBadge")}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted">
                            {store.description || `/${store.slug}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[260px]">
                        <p className="truncate font-medium text-ink">
                          {store.address}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {store.cityStateZip}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StoreStatusBadge status={store.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatNumber(store.taxRate, locale)}%
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted tabular-nums">
                      {formatDateTime(store.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={isActiveContext ? "secondary" : "outline"}
                          disabled={isActiveContext}
                          onClick={() => handleSwitchStore(store)}
                        >
                          {isActiveContext
                            ? tStores("currentContext")
                            : tStores("switchContext")}
                        </Button>

                        <Button
                          nativeButton={false}
                          render={
                            <Link href={`/stores/${store.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          }
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tCommon("actions.edit")}
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={tStores("columns.actions")}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              render={
                                <Link href={`/stores/${store.id}`}>
                                  <Eye className="h-4 w-4 text-muted" />
                                  <span>{tCommon("actions.view")}</span>
                                </Link>
                              }
                            />

                            <DropdownMenuItem
                              render={
                                <Link href={`/stores/${store.id}/edit`}>
                                  <Edit className="h-4 w-4 text-muted" />
                                  <span>{tCommon("actions.edit")}</span>
                                </Link>
                              }
                            />

                            <DropdownMenuItem
                              onClick={async () => {
                                await handleSwitchStore(store);
                                router.push("/products");
                              }}
                            >
                              <StoreIcon className="h-4 w-4 text-muted" />
                              <span>{tStores("viewCatalog")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {store.status === StoreStatus.ACTIVE ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusDialogState({
                                    store,
                                    targetStatus: StoreStatus.INACTIVE,
                                  })
                                }
                              >
                                <PauseCircle className="h-4 w-4 text-warning" />
                                <span>{tCommon("actions.deactivate")}</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusDialogState({
                                    store,
                                    targetStatus: StoreStatus.ACTIVE,
                                  })
                                }
                              >
                                <PlayCircle className="h-4 w-4 text-success" />
                                <span>{tCommon("actions.activate")}</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingStore(store)}
                              className="text-destructive focus:bg-destructive-bg focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{tCommon("actions.delete")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {meta ? (
          <PaginationBar
            meta={meta}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onLimitChange={(nextLimit) =>
              updateParams({ limit: nextLimit, page: 1 })
            }
          />
        ) : null}
      </Card>

      <StoreStatusDialog
        store={statusDialogState.store}
        targetStatus={statusDialogState.targetStatus}
        onClose={() =>
          setStatusDialogState({ store: null, targetStatus: null })
        }
      />

      <StoreDeleteDialog
        store={deletingStore}
        onClose={() => setDeletingStore(null)}
      />
    </div>
  );
}
