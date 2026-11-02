"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FolderTree,
  Package,
  Plus,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useActiveStore } from "@/stores/active-store-context";
import { useDashboardSummary } from "@/features/dashboard/api/dashboard.queries";
import { useUpdateProduct } from "@/features/products/api/product.queries";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumbnail } from "@/components/shared/product-thumbnail";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeSelect } from "@/components/shared/date-range-select";
import {
  QuickAction,
  QuickActionsMenu,
} from "@/components/shared/quick-actions-menu";

export function DashboardOverviewView() {
  const { activeStoreId } = useActiveStore();
  const [dateRange, setDateRange] = React.useState("30d");

  const createActions: QuickAction[] = [
    { label: "New Store", icon: StoreIcon, href: "/stores/new" },
    { label: "New Category", icon: FolderTree, href: "/categories/new" },
    { label: "Add Product", icon: Plus, href: "/products/new" },
  ];

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardSummary(activeStoreId);

  const updateProductMutation = useUpdateProduct();

  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard overview"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const handleQuickRestock = (
    productId: string,
    productName: string,
    currentQty: number,
  ) => {
    updateProductMutation.mutate(
      {
        productId,
        payload: { stockQuantity: currentQty + 15 },
      },
      {
        onSuccess: () => {
          toast.success(`Restocked +15 units for "${productName}"`);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to restock item",
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Store Context Selector */}
      <PageHeader
        title="Welcome back, Sarah"
        description="Monitor store-scoped catalog coverage, inventory thresholds, and multi-location POS readiness."
        actions={
          <>
            <DateRangeSelect value={dateRange} onValueChange={setDateRange} />
            <QuickActionsMenu actions={createActions} />
          </>
        }
      />

      {/* 4-Column Summary KPI Strip (Strictly Store, Product, Category & Low-Stock Metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-3 h-7 w-16" />
              <Skeleton className="mt-2 h-3 w-36" />
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
                    {formatNumber(summary.metrics.totalStores)}
                  </span>
                  <span className="text-xs font-medium text-success-foreground">
                    {summary.metrics.activeStores} Active POS
                  </span>
                </div>
                <Link
                  href="/stores"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Manage locations
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-brand-navy">
                <StoreIcon className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Products in Store
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {formatNumber(summary.metrics.storeProductsCount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    of {formatNumber(summary.metrics.networkProductsCount)}{" "}
                    network SKUs
                  </span>
                </div>
                <Link
                  href="/products"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open store catalog
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Package className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Total Categories
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {formatNumber(summary.metrics.totalCategoriesCount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {summary.metrics.storeCategoriesCount} mapped to{" "}
                    {summary.activeStore.code}
                  </span>
                </div>
                <Link
                  href="/categories"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Configure hierarchy
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-brand-navy">
                <FolderTree className="h-5 w-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Low-Stock Summary
                </span>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold text-foreground">
                    {formatNumber(summary.metrics.lowStockCount)}
                  </span>
                  <span
                    className={
                      summary.metrics.lowStockCount > 0
                        ? "text-xs font-medium text-warning-foreground"
                        : "text-xs font-medium text-success-foreground"
                    }
                  >
                    {summary.metrics.outOfStockCount > 0
                      ? `${summary.metrics.outOfStockCount} out of stock`
                      : summary.metrics.lowStockCount > 0
                        ? "Below threshold"
                        : "All healthy"}
                  </span>
                </div>
                <Link
                  href="/products?stockHealth=LOW_STOCK"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Review stock alerts
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-bg text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main 12-Column Operational Workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left 8 Columns: Recently Updated Products & Low-Stock Action Queue */}
        <div className="flex flex-col gap-6 xl:col-span-8">
          <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Recently Updated Products
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest catalog modifications in{" "}
                  <span className="font-medium text-foreground">
                    {summary?.activeStore.name ?? "active store"}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/products" />}
                size="sm"
              >
                View All Products
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-11 w-full" />
                ))}
              </div>
            ) : (summary?.recentlyUpdatedProducts.length ?? 0) === 0 ? (
              <EmptyState
                icon={Package}
                title="No products mapped to this store yet"
                description="Start building this store's catalog by adding your first retail SKU."
                action={
                  <Button
                    nativeButton={false}
                    render={<Link href="/products/new" />}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Product
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product & SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Inventory</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.recentlyUpdatedProducts.map((product) => {
                    const isOut = product.stockQuantity === 0;
                    const isLow =
                      !isOut &&
                      product.stockQuantity <= product.lowStockThreshold;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProductThumbnail
                              imageUrl={product.imageUrl}
                              name={product.name}
                              sku={product.sku}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/products/${product.id}`}
                                className="block truncate font-medium text-foreground hover:text-primary"
                              >
                                {product.name}
                              </Link>
                              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.categoryName}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {isOut ? (
                            <StatusBadge variant="destructive">
                              Out of Stock (0)
                            </StatusBadge>
                          ) : isLow ? (
                            <StatusBadge variant="warning">
                              Low ({product.stockQuantity})
                            </StatusBadge>
                          ) : (
                            <span className="text-xs font-medium text-success-foreground">
                              {product.stockQuantity} in stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatRelativeTime(product.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            nativeButton={false}
                            render={
                              <Link href={`/products/${product.id}/edit`} />
                            }
                            size="sm"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Low-Stock Replenishment Queue */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Low-Stock Replenishment Queue
                </h2>
                <p className="text-xs text-muted-foreground">
                  SKUs at or below their configured store threshold in{" "}
                  {summary?.activeStore.name ?? "active store"}
                </p>
              </div>
              <StatusBadge
                variant={
                  (summary?.lowStockItems.length ?? 0) > 0
                    ? "warning"
                    : "success"
                }
                className="tabular-nums"
              >
                {summary?.lowStockItems.length ?? 0} Alert
                {(summary?.lowStockItems.length ?? 0) === 1 ? "" : "s"}
              </StatusBadge>
            </div>

            {isLoading ? (
              <div className="space-y-2.5 p-5">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (summary?.lowStockItems.length ?? 0) === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                All SKUs in {summary?.activeStore.name} are stocked above
                minimum threshold levels.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {summary?.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 px-5 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${item.id}`}
                          className="truncate text-[13px] font-semibold text-foreground hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {item.sku}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        Current stock:{" "}
                        <strong
                          className={
                            item.stockQuantity === 0
                              ? "text-destructive"
                              : "text-warning-foreground"
                          }
                        >
                          {item.stockQuantity} units
                        </strong>{" "}
                        · Threshold: {item.lowStockThreshold} units
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={updateProductMutation.isPending}
                        onClick={() =>
                          handleQuickRestock(
                            item.id,
                            item.name,
                            item.stockQuantity,
                          )
                        }
                      >
                        +15 Restock
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={`/products/${item.id}/edit`} />}
                        size="sm"
                      >
                        Adjust
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 4 Columns: Active Store Context Card & Recent Operational Activity */}
        <div className="flex flex-col gap-6 xl:col-span-4">
          {summary?.activeStore && (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    Active Store Summary
                  </span>
                  <h2 className="mt-1 text-base font-semibold text-foreground">
                    {summary.activeStore.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {summary.activeStore.code} · {summary.activeStore.format}
                  </p>
                </div>
                <StatusBadge
                  variant={
                    summary.activeStore.status === "ACTIVE"
                      ? "success"
                      : "secondary"
                  }
                >
                  {summary.activeStore.status === "ACTIVE"
                    ? "Active POS"
                    : "Setup Phase"}
                </StatusBadge>
              </div>

              <dl className="mt-4 space-y-2.5 border-t border-border pt-3.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-right font-medium text-foreground">
                    {summary.activeStore.address}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">District</dt>
                  <dd className="text-right text-foreground">
                    {summary.activeStore.cityStateZip}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Store Manager</dt>
                  <dd className="text-right font-medium text-foreground">
                    {summary.activeStore.managerName}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 tabular-nums">
                  <dt className="text-muted-foreground">In-Stock Coverage</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {summary.activeStore.skuCount > 0
                      ? `${summary.activeStore.inStockRate}%`
                      : "No SKUs mapped"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3.5">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/stores/${summary.activeStore.id}`} />}
                  className="flex-1"
                  size="sm"
                >
                  Store Details
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href={`/stores/${summary.activeStore.id}/edit`} />
                  }
                  className="flex-1"
                  size="sm"
                >
                  Edit Store
                </Button>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">
                Recent Workspace Activity
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest store, product, and category audit events
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {summary?.recentActivity.map((log) => (
                  <div key={log.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-foreground truncate">
                        {log.entityName}
                      </span>
                      {log.storeCode && (
                        <span className="font-mono text-[11px] text-primary tabular-nums shrink-0">
                          {log.storeCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {log.action}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(log.timestamp)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{log.actorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
