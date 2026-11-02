"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  Package,
  Plus,
  Search,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import {
  downloadCsv,
  formatCurrency,
  formatNumber,
  formatRelativeTime,
} from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useDeleteProduct,
  useProducts,
} from "@/features/products/api/product.queries";
import { useCategories } from "@/features/categories/api/category.queries";
import type {
  Product,
  ProductSortField,
  ProductStatus,
  SortDirection,
  StockHealthFilter,
} from "@/features/products/types/product.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumbnail } from "@/components/shared/product-thumbnail";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import {
  QuickAction,
  QuickActionsMenu,
} from "@/components/shared/quick-actions-menu";
import { PageHeader } from "@/components/shared/page-header";

export function ProductsManagementView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeStoreId, activeStore } = useActiveStore();

  // Sync filters & sorting with URL searchParams
  const searchParam = searchParams.get("search") ?? "";
  const categoryIdParam = searchParams.get("categoryId") ?? "ALL";
  const statusParam =
    (searchParams.get("status") as ProductStatus | "ALL" | null) ?? "ALL";
  const stockHealthParam =
    (searchParams.get("stockHealth") as StockHealthFilter | null) ?? "ALL";
  const sortByParam =
    (searchParams.get("sortBy") as ProductSortField | null) ?? "updatedAt";
  const sortOrderParam =
    (searchParams.get("sortOrder") as SortDirection | null) ?? "desc";
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "10");

  const [searchInput, setSearchInput] = React.useState(searchParam);
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null,
  );
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(
    null,
  );

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        updateUrlParams({ search: searchInput || null, page: "1" });
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchInput, searchParam, updateUrlParams]);

  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    storeId: activeStoreId,
    search: searchParam,
    categoryId: categoryIdParam,
    status: statusParam,
    stockHealth: stockHealthParam,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    page: pageParam,
    pageSize: pageSizeParam,
  });

  const createActions: QuickAction[] = [
    {
      label: "Export",
      icon: Download,
      onSelect: () => {
        handleExportCatalog();
      },
    },
    {
      label: "Add Product (Quick Modal)",
      icon: Plus,
      onSelect: () => {
        setEditingProduct(null);
        setFormDialogOpen(true);
      },
    },
    {
      label: "Add Product (Full Page)",
      icon: FileText,
      href: "/products/new",
    },
  ];

  const { data: categoriesResponse } = useCategories({
    storeId: activeStoreId,
    page: 1,
    pageSize: 100,
  });

  const deleteProductMutation = useDeleteProduct();

  const storeCategories = React.useMemo(
    () =>
      (categoriesResponse?.data ?? []).filter(
        (c) => c.appliesToAllStores || c.storeIds.includes(activeStoreId),
      ),
    [categoriesResponse?.data, activeStoreId],
  );

  const products = productsResponse?.data ?? [];
  const summary = productsResponse?.summary;

  const toggleSort = React.useCallback(
    (field: ProductSortField) => {
      if (sortByParam === field) {
        updateUrlParams({
          sortOrder: sortOrderParam === "asc" ? "desc" : "asc",
          page: "1",
        });
      } else {
        updateUrlParams({
          sortBy: field,
          sortOrder: field === "name" || field === "sku" ? "asc" : "desc",
          page: "1",
        });
      }
    },
    [sortByParam, sortOrderParam, updateUrlParams],
  );

  const renderSortIcon = React.useCallback(
    (field: ProductSortField) => {
      if (sortByParam !== field) {
        return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
      }
      return sortOrderParam === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-primary" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-primary" />
      );
    },
    [sortByParam, sortOrderParam],
  );

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <button
            type="button"
            onClick={() => toggleSort("name")}
            className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em] hover:text-foreground cursor-pointer"
          >
            <span>Product</span>
            {renderSortIcon("name")}
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <ProductThumbnail
                imageUrl={item.imageUrl}
                name={item.name}
                sku={item.sku}
                size="sm"
              />
              <div className="min-w-0">
                <Link
                  href={`/products/${item.id}`}
                  className="block truncate font-semibold text-foreground hover:text-primary max-w-[260px]"
                >
                  {item.name}
                </Link>
                {item.description && (
                  <p className="truncate text-xs text-muted-foreground max-w-[260px]">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: () => (
          <button
            type="button"
            onClick={() => toggleSort("sku")}
            className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em] hover:text-foreground cursor-pointer"
          >
            <span>SKU</span>
            {renderSortIcon("sku")}
          </button>
        ),
        cell: ({ row }) => (
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {row.original.sku}
          </span>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => (
          <Link
            href={`/categories/${row.original.categoryId}`}
            className="text-[13px] text-muted-foreground hover:text-primary"
          >
            {row.original.categoryName}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === "ACTIVE")
            return <StatusBadge variant="success">Active</StatusBadge>;
          if (st === "DRAFT")
            return <StatusBadge variant="warning">Draft</StatusBadge>;
          return <StatusBadge variant="secondary">Archived</StatusBadge>;
        },
      },
      {
        accessorKey: "price",
        header: () => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => toggleSort("price")}
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em] hover:text-foreground cursor-pointer"
            >
              <span>Price</span>
              {renderSortIcon("price")}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-semibold text-foreground tabular-nums">
            {formatCurrency(row.original.price)}
          </div>
        ),
      },
      {
        accessorKey: "stockQuantity",
        header: () => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => toggleSort("stockQuantity")}
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em] hover:text-foreground cursor-pointer"
            >
              <span>Stock</span>
              {renderSortIcon("stockQuantity")}
            </button>
          </div>
        ),
        cell: ({ row }) => {
          const { stockQuantity, lowStockThreshold } = row.original;
          const isOut = stockQuantity === 0;
          const isLow = !isOut && stockQuantity <= lowStockThreshold;

          return (
            <div className="flex flex-col items-end tabular-nums">
              <span
                className={
                  isOut
                    ? "font-semibold text-destructive"
                    : isLow
                      ? "font-semibold text-warning-foreground"
                      : "font-medium text-foreground"
                }
              >
                {stockQuantity} units
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isOut
                  ? "Out of stock"
                  : isLow
                    ? `Low (≤${lowStockThreshold})`
                    : `Min ${lowStockThreshold}`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: () => (
          <button
            type="button"
            onClick={() => toggleSort("updatedAt")}
            className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em] hover:text-foreground cursor-pointer"
          >
            <span>Updated</span>
            {renderSortIcon("updatedAt")}
          </button>
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatRelativeTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                nativeButton={false}
                render={<Link href={`/products/${item.id}`} />}
                title="View product details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Quick edit product"
                onClick={() => {
                  setEditingProduct(item);
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
                      aria-label={`Actions for ${item.name}`}
                    />
                  }
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => router.push(`/products/${item.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Product Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/products/${item.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Full Page</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingProduct(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete SKU</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [renderSortIcon, router, toggleSort],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExportCatalog = () => {
    if (products.length === 0) {
      toast.error("No products in current view to export");
      return;
    }

    downloadCsv(
      `catalog-${activeStore?.slug ?? "store"}.csv`,
      [
        "SKU",
        "Product Name",
        "Category",
        "Status",
        "Price",
        "Stock",
        "Threshold",
      ],
      products.map((p) => [
        p.sku,
        p.name,
        p.categoryName,
        p.status,
        p.price.toFixed(2),
        p.stockQuantity,
        p.lowStockThreshold,
      ]),
    );
    toast.success(`Exported ${products.length} SKUs to CSV`);
  };

  if (isError) {
    return (
      <ErrorState
        title="Unable to load store product catalog"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Context Header */}
      <PageHeader
        title="Products Management"
        description="Manage SKUs, unit pricing, category mappings, and inventory alert thresholds."
        actions={<QuickActionsMenu actions={createActions} />}
      />

      {/* Store Catalog KPI Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Total Store SKUs
          </span>
          <div className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
            {formatNumber(summary?.totalStoreProducts ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Active on POS
          </span>
          <div className="mt-1 text-2xl font-semibold text-success-foreground tabular-nums">
            {formatNumber(summary?.activeProducts ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Low Stock Warning
          </span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold text-warning-foreground tabular-nums">
            <span>{formatNumber(summary?.lowStockProducts ?? 0)}</span>
            {(summary?.lowStockProducts ?? 0) > 0 && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Out of Stock
          </span>
          <div className="mt-1 text-2xl font-semibold text-destructive tabular-nums">
            {formatNumber(summary?.outOfStockProducts ?? 0)}
          </div>
        </Card>
      </div>

      {/* Data Table Card */}
      <Card className="overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 xl:flex-row xl:items-center">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="pl-9 bg-background"
              />
            </div>

            <div className="w-full sm:w-52">
              <Select
                value={categoryIdParam}
                onValueChange={(value) =>
                  updateUrlParams({ categoryId: value, page: "1" })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {storeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={statusParam}
                onValueChange={(value) =>
                  updateUrlParams({ status: value, page: "1" })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Status: All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={stockHealthParam}
                onValueChange={(value) =>
                  updateUrlParams({ stockHealth: value, page: "1" })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Stock: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Inventory: All</SelectItem>
                  <SelectItem value="IN_STOCK">Healthy Stock</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchParam ||
            categoryIdParam !== "ALL" ||
            statusParam !== "ALL" ||
            stockHealthParam !== "ALL") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                updateUrlParams({
                  search: null,
                  categoryId: null,
                  status: null,
                  stockHealth: null,
                  page: "1",
                });
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={`No products found in ${activeStore?.name ?? "this store"}`}
            description="Either no SKUs match your active filters, or this store is still in Setup Phase with an empty catalog."
            action={
              <div className="flex items-center gap-2">
                {(searchParam ||
                  categoryIdParam !== "ALL" ||
                  statusParam !== "ALL" ||
                  stockHealthParam !== "ALL") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchInput("");
                      updateUrlParams({
                        search: null,
                        categoryId: null,
                        status: null,
                        stockHealth: null,
                        page: "1",
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {activeStore && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingProduct(null);
                      setFormDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add First SKU
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {productsResponse?.meta && (
          <PaginationBar
            meta={productsResponse.meta}
            itemLabel="SKUs"
            onPageChange={(nextPage) =>
              updateUrlParams({ page: String(nextPage) })
            }
            onPageSizeChange={(nextSize) =>
              updateUrlParams({ pageSize: String(nextSize), page: "1" })
            }
          />
        )}
      </Card>

      {activeStore && (
        <ProductFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          activeStore={activeStore}
          categories={storeCategories}
          editingProduct={editingProduct}
        />
      )}

      {/* Delete Product Confirmation */}
      <AlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Product &ldquo;{deletingProduct?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              SKU{" "}
              <strong className="font-mono text-foreground">
                {deletingProduct?.sku}
              </strong>{" "}
              will be permanently removed from {activeStore?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteProductMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (!deletingProduct) return;
                deleteProductMutation.mutate(deletingProduct.id, {
                  onSuccess: () => {
                    toast.success(`Deleted SKU ${deletingProduct.sku}`);
                    setDeletingProduct(null);
                  },
                  onError: (err) => {
                    toast.error(getErrorMessage(err));
                    setDeletingProduct(null);
                  },
                });
              }}
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
