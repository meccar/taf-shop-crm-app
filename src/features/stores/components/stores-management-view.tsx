"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Clock,
  Copy,
  Cpu,
  Download,
  Edit,
  ExternalLink,
  FileText,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Package,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { APP_ASSETS } from "@/lib/constants/assets";
import { getErrorMessage } from "@/lib/api/errors";
import {
  cn,
  downloadCsv,
  formatNumber,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useDeleteStore,
  useStores,
  useUpdateStore,
} from "@/features/stores/api/store.queries";
import type {
  Store,
  StoreFormat,
  StoreStatus,
} from "@/features/stores/types/store.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StoreFormDialog } from "@/features/stores/components/store-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import {
  QuickAction,
  QuickActionsMenu,
} from "@/components/shared/quick-actions-menu";
import { useAuth } from "@/stores/auth-context";

export function StoresManagementView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeStoreId, setActiveStoreId } = useActiveStore();
  const { user } = useAuth();

  // Read filters from URL searchParams
  const searchParam = searchParams.get("search") ?? "";
  const statusParam =
    (searchParams.get("status") as StoreStatus | "ALL" | null) ?? "ALL";
  const formatParam =
    (searchParams.get("format") as StoreFormat | "ALL" | null) ?? "ALL";
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "10");
  const viewMode = searchParams.get("view") === "grid" ? "grid" : "table";

  const [searchInput, setSearchInput] = React.useState(searchParam);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingStore, setEditingStore] = React.useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = React.useState<Store | null>(null);
  const [pairHardwareOpen, setPairHardwareOpen] = React.useState(false);
  const [pairingStoreId, setPairingStoreId] = React.useState<string | null>(
    null,
  );
  const [mapImageError, setMapImageError] = React.useState(false);

  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "ALL") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounced search sync to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        updateUrlParams({ search: searchInput || null, page: "1" });
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchInput, searchParam, updateUrlParams]);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useStores({
    search: searchParam,
    isActive: statusParam === "ALL" ? undefined : statusParam === "ACTIVE",
    customerId: user?.customerId ?? null,
    page: pageParam,
    limit: pageSizeParam,
    sortBy: "name",
    sortOrder: "asc",
  });

  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();

  const stores = response?.data ?? [];
  const summary = response?.summary;

  const handleExportCsv = () => {
    if (stores.length === 0) {
      toast.error("No stores available to export");
      return;
    }

    downloadCsv(
      "shop-crm-stores-matrix.csv",
      [
        "Code",
        "Store Name",
        "Format",
        "Status",
        "Address",
        "Location",
        "Assigned SKUs",
        "In-Stock %",
        "Manager",
        "Manager Email",
      ],
      stores.map((s) => [
        s.code,
        s.name,
        s.format,
        s.status,
        s.address,
        s.cityStateZip,
        s.skuCount,
        `${s.inStockRate}%`,
        s.managerName,
        s.managerEmail,
      ]),
    );
    toast.success(`Exported ${stores.length} store records to CSV`);
  };

  const createActions: QuickAction[] = [
    {
      label: "Export",
      icon: Download,
      onSelect: () => {
        handleExportCsv();
      },
    },
    {
      label: "Create Store (Quick Modal)",
      icon: Plus,
      onSelect: () => {
        setEditingStore(null);
        setFormDialogOpen(true);
      },
    },
    {
      label: "Create Store (Full Page)",
      icon: FileText,
      href: "/stores/new",
    },
  ];

  const handleToggleStoreStatus = (store: Store) => {
    const nextStatus: StoreStatus =
      store.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStoreMutation.mutate(
      { storeId: store.id, payload: { status: nextStatus } },
      {
        onSuccess: () => {
          toast.success(
            nextStatus === "ACTIVE"
              ? `Activated POS sync for ${store.name}`
              : `Moved ${store.name} to Inactive (Setup Phase)`,
          );
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingStore) return;
    const target = deletingStore;

    deleteStoreMutation.mutate(target.id, {
      onSuccess: () => {
        toast.success(`Deleted store "${target.name}" (${target.code})`);
        setDeletingStore(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
        setDeletingStore(null);
      },
    });
  };

  const allVisibleSelected =
    stores.length > 0 && stores.every((s) => selectedIds.includes(s.id));

  const pairingToken = React.useMemo(() => {
    const targetCode =
      stores.find((s) => s.id === pairingStoreId)?.code.replace("#", "") ??
      "STR-01";
    return `POS-${targetCode}-994A-7F2E`;
  }, [stores, pairingStoreId]);

  if (isError) {
    return (
      <ErrorState
        title="Unable to load stores directory"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header matching Stitch Screen 1 */}
      <PageHeader
        title="Stores Management"
        description="Manage physical retail locations, store codes, active POS integrations, and store-level catalog assignments."
        actions={<QuickActionsMenu actions={createActions} />}
      />

      {/* 4-Card KPI Strip matching Stitch Screen 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-2.5 h-7 w-20" />
            </Card>
          ))
        ) : (
          <>
            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Total Stores
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {summary.totalStores}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    100% capacity
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-brand-navy">
                <StoreIcon className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Active POS Terminals
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {summary.activeStores}
                  </span>
                  <span className="text-xs font-medium text-success-foreground">
                    Syncing live
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-high text-primary">
                <Cpu className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Catalog SKUs Deployed
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {formatNumber(summary.totalCatalogSkus)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    across nodes
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-brand-navy">
                <Package className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Setup / Inactive
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {summary.inactiveStores}
                  </span>
                  <span className="truncate max-w-[130px] text-xs font-medium text-muted-foreground">
                    {summary.inactiveStoreLabel ?? "None pending"}
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Stores Management Container */}
      <Card className="overflow-hidden">
        {/* Controls Toolbar */}
        <div className="flex flex-col justify-between gap-3 p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stores by name, store code, address..."
                className="pl-9 bg-background"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={statusParam}
                onValueChange={(value) =>
                  updateUrlParams({ status: value, page: "1" })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Status: All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    Status: All Stores ({summary?.totalStores ?? 0})
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    Active POS ({summary?.activeStores ?? 0})
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    Inactive / Setup ({summary?.inactiveStores ?? 0})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={formatParam}
                onValueChange={(value) =>
                  updateUrlParams({ format: value, page: "1" })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Format: Any Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Format: Any Format</SelectItem>
                  <SelectItem value="FLAGSHIP">Flagship Center</SelectItem>
                  <SelectItem value="MALL">Mall Boutique</SelectItem>
                  <SelectItem value="OUTLET">Outlet Clearance</SelectItem>
                  <SelectItem value="POPUP">Pop-up Kiosk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Counter & View Switcher */}
          <div className="flex items-center justify-between gap-3 sm:justify-end shrink-0">
            <span className="hidden text-xs text-muted-foreground xl:inline tabular-nums">
              Showing {stores.length} of {response?.meta.totalItems ?? 0}{" "}
              locations
            </span>
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => updateUrlParams({ view: null })}
                title="Table View"
                className={cn(
                  "rounded-md p-1.5 transition-colors cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => updateUrlParams({ view: "grid" })}
                title="Grid View"
                className={cn(
                  "rounded-md p-1.5 transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Scope Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border bg-accent/50 px-4 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Active scope:</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-navy">
              Multi-store inventory live sync enabled
              <RefreshCw className="h-3 w-3 text-primary" />
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            Cluster US-EAST
          </span>
        </div>

        {/* Loading, Empty, Table, or Grid View */}
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon={StoreIcon}
            title="No matching retail stores"
            description="Adjust your search query or status filters, or provision a new retail location."
            action={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    updateUrlParams({
                      search: null,
                      status: null,
                      format: null,
                      page: "1",
                    });
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditingStore(null);
                    setFormDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Store
                </Button>
              </div>
            }
          />
        ) : viewMode === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(stores.map((s) => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    aria-label="Select all stores"
                  />
                </TableHead>
                <TableHead>Store Name & Code</TableHead>
                <TableHead>Location / Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Assigned SKUs</TableHead>
                <TableHead>Primary Manager</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => {
                const isCurrentContext = store.id === activeStoreId;
                const isSelected = selectedIds.includes(store.id);

                return (
                  <TableRow
                    key={store.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(isCurrentContext && "bg-accent/35")}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, store.id]
                              : prev.filter((id) => id !== store.id),
                          );
                        }}
                        aria-label={`Select ${store.name}`}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isCurrentContext
                              ? "bg-accent-high text-brand-navy"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Link
                              href={`/stores/${store.id}`}
                              className="truncate text-sm font-semibold text-foreground hover:text-primary"
                            >
                              {store.name}
                            </Link>
                            <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brand-navy tabular-nums">
                              {store.code}
                            </span>
                            {isCurrentContext && (
                              <StatusBadge
                                variant="default"
                                className="text-[10px] px-1.5 py-0"
                              >
                                Active Context
                              </StatusBadge>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground max-w-[280px]">
                            {store.description ?? `${store.format} Location`}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">
                          {store.address}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {store.cityStateZip}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {store.status === "ACTIVE" ? (
                        <StatusBadge variant="success">Active POS</StatusBadge>
                      ) : (
                        <StatusBadge variant="secondary">
                          Inactive (Setup Phase)
                        </StatusBadge>
                      )}
                    </TableCell>

                    <TableCell className="text-right tabular-nums">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-[13px] font-semibold text-foreground">
                          {formatNumber(store.skuCount)} SKUs
                        </span>
                        {store.skuCount > 0 ? (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {store.inStockRate}% in stock
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-destructive">
                            No catalog mapped
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[11px] font-semibold text-white">
                          {getInitials(store.managerName)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-foreground">
                            {store.managerName}
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {store.managerEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatRelativeTime(store.updatedAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {isCurrentContext ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled
                            className="h-7 px-2.5 text-xs"
                          >
                            Current
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2.5 text-xs hover:bg-primary hover:text-white"
                            onClick={() => {
                              setActiveStoreId(store.id);
                              toast.success(
                                `Switched active context to ${store.name}`,
                              );
                            }}
                          >
                            Switch Context
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Quick edit store"
                          onClick={() => {
                            setEditingStore(store);
                            setFormDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`More actions for ${store.name}`}
                              />
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => router.push(`/stores/${store.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>View Store Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/stores/${store.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit on Full Page</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActiveStoreId(store.id);
                                router.push("/products");
                              }}
                            >
                              <Package className="h-4 w-4 text-primary" />
                              <span>View Store Catalog</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStoreStatus(store)}
                            >
                              {store.status === "ACTIVE" ? (
                                <>
                                  <PauseCircle className="h-4 w-4 text-warning" />
                                  <span>Deactivate Store</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 text-success" />
                                  <span>Activate POS</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingStore(store)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Store</span>
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
        ) : (
          /* Card Grid View */
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {stores.map((store) => {
              const isCurrentContext = store.id === activeStoreId;
              return (
                <div
                  key={store.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border border-border p-4 transition-colors",
                    isCurrentContext
                      ? "bg-accent/40 border-primary/30"
                      : "bg-background hover:bg-accent/25",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            isCurrentContext
                              ? "bg-primary text-white"
                              : "bg-accent text-brand-navy",
                          )}
                        >
                          <StoreIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <Link
                            href={`/stores/${store.id}`}
                            className="text-sm font-semibold text-foreground hover:text-primary"
                          >
                            {store.name}
                          </Link>
                          <div className="font-mono text-xs font-semibold text-primary tabular-nums">
                            {store.code}
                          </div>
                        </div>
                      </div>
                      <StatusBadge
                        variant={
                          store.status === "ACTIVE" ? "success" : "secondary"
                        }
                      >
                        {store.status === "ACTIVE"
                          ? "Active POS"
                          : "Setup Phase"}
                      </StatusBadge>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {store.address}, {store.cityStateZip}
                      </span>
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                      <div>
                        <span className="block text-[11px] text-muted-foreground">
                          Assigned SKUs
                        </span>
                        <span className="text-[13px] font-semibold text-foreground tabular-nums">
                          {store.skuCount} Items
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground">
                          Store Lead
                        </span>
                        <span className="text-[13px] font-semibold text-foreground">
                          {store.managerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      Updated {formatRelativeTime(store.updatedAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={`/stores/${store.id}`} />}
                        size="sm"
                      >
                        Details
                      </Button>
                      {isCurrentContext ? (
                        <Button variant="secondary" size="sm" disabled>
                          Current Context
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveStoreId(store.id);
                            toast.success(`Switched context to ${store.name}`);
                          }}
                        >
                          Switch Context
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {response?.meta && (
          <PaginationBar
            meta={response.meta}
            itemLabel="records"
            onPageChange={(nextPage) =>
              updateUrlParams({ page: String(nextPage) })
            }
            onPageSizeChange={(nextSize) =>
              updateUrlParams({ pageSize: String(nextSize), page: "1" })
            }
          />
        )}
      </Card>

      {/* Bottom Footprint Distribution & POS Integration Gateway Strip */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Store Footprint Distribution
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Greater Metro Area
            </span>
          </div>

          <div className="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-accent/40">
            {!mapImageError ? (
              <img
                src={APP_ASSETS.metroFootprintMap}
                alt="Greater Metro Area Store Footprint Map"
                referrerPolicy="no-referrer"
                onError={() => setMapImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Metro Store Footprint Map
              </div>
            )}
            <div className="absolute bottom-2.5 left-2.5 rounded-md border border-border bg-card/95 px-2.5 py-1 font-mono text-[11px] font-medium text-foreground shadow-xs backdrop-blur-xs tabular-nums">
              Geo-bounding:{" "}
              {stores.map((s) => s.code.replace("#", "")).join(", ") ||
                "STR-01"}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-accent/55 p-5">
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-high text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              POS Integration Gateway
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Need to sync barcode scanners or activate a setup-phase retail
              register? Generate a universal provisioning token in seconds.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              POS Sync Protocol v2.4
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const defaultTarget =
                  stores.find((s) => s.status === "INACTIVE")?.id ??
                  activeStoreId;
                setPairingStoreId(defaultTarget);
                setPairHardwareOpen(true);
              }}
            >
              Pair Hardware
            </Button>
          </div>
        </Card>
      </div>

      {/* Create / Edit Store Quick Modal */}
      <StoreFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editingStore={editingStore}
        totalStoresCount={summary?.totalStores ?? stores.length}
      />

      {/* Pair Hardware Token Provisioner Dialog */}
      <Dialog open={pairHardwareOpen} onOpenChange={setPairHardwareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pair Store POS Hardware</DialogTitle>
            <DialogDescription>
              Select a target store location to generate a terminal pairing
              token and optionally activate live POS sync.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">
                Target Store Location
              </span>
              <Select
                value={pairingStoreId}
                onValueChange={(value) => {
                  if (value === null) return;
                  setPairingStoreId(value);
                }}
              >
                {" "}
                <SelectTrigger>
                  <SelectValue placeholder="Choose store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code}) —{" "}
                      {s.status === "ACTIVE" ? "Active" : "Setup Phase"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-background p-3">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Provisioning Token
              </span>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <code className="font-mono text-sm font-semibold text-brand-navy tabular-nums">
                  {pairingToken}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(pairingToken);
                    toast.success("Copied POS pairing token to clipboard");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPairHardwareOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={updateStoreMutation.isPending || !pairingStoreId}
              onClick={() => {
                const target = stores.find((s) => s.id === pairingStoreId);
                if (!target) return;
                updateStoreMutation.mutate(
                  { storeId: target.id, payload: { status: "ACTIVE" } },
                  {
                    onSuccess: () => {
                      toast.success(
                        `POS terminal paired & ${target.name} marked Active`,
                      );
                      setPairHardwareOpen(false);
                    },
                  },
                );
              }}
            >
              Confirm Pairing & Activate POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destructive Store Deletion Confirmation */}
      <AlertDialog
        open={Boolean(deletingStore)}
        onOpenChange={(open) => !open && setDeletingStore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Store &ldquo;{deletingStore?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action permanently removes store{" "}
              <strong className="text-foreground">{deletingStore?.code}</strong>{" "}
              and its{" "}
              <strong className="text-foreground">
                {deletingStore?.skuCount ?? 0} store-scoped SKU records
              </strong>
              . This operation cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStoreMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteStoreMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
