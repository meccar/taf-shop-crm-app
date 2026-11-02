"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  GitBranch,
  History,
  Info,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { cn, downloadCsv, formatNumber, formatRelativeTime } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useCategories,
  useDeleteCategory,
  useReorderCategories,
} from "@/features/categories/api/category.queries";
import { useActivityLogs } from "@/features/dashboard/api/dashboard.queries";
import type {
  Category,
  CategoryOccupancyFilter,
} from "@/features/categories/types/category.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { CategoryIcon } from "@/components/shared/category-icon";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import {
  QuickAction,
  QuickActionsMenu,
} from "@/components/shared/quick-actions-menu";

export function CategoriesManagementView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeStoreId, stores } = useActiveStore();

  const searchParam = searchParams.get("search") ?? "";
  const occupancyParam =
    (searchParams.get("occupancy") as CategoryOccupancyFilter | null) ?? "ALL";
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "10");

  const [searchInput, setSearchInput] = React.useState(searchParam);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] =
    React.useState<Category | null>(null);
  const [reorderDialogOpen, setReorderDialogOpen] = React.useState(false);
  const [draftOrder, setDraftOrder] = React.useState<Category[]>([]);
  const [auditLogOpen, setAuditLogOpen] = React.useState(false);

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

  const createActions: QuickAction[] = [
    {
      label: "Reorder POS",
      icon: ArrowUpDown,
      onSelect: () => {
        openReorderModal();
      },
    },
    {
      label: "Add Category (Quick Modal)",
      icon: Plus,
      onSelect: () => {
        setEditingCategory(null);
        setFormDialogOpen(true);
      },
    },
    {
      label: "Add Category (Full Page)",
      icon: FileText,
      href: "/categories/new",
    },
  ];

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
  } = useCategories({
    search: searchParam,
    occupancy: occupancyParam,
    storeId: activeStoreId,
    page: pageParam,
    pageSize: pageSizeParam,
  });

  const { data: allCategoriesForReorder } = useCategories({
    page: 1,
    pageSize: 100,
  });

  const { data: activityLogs } = useActivityLogs();

  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  const categories = response?.data ?? [];
  const counts = response?.counts;

  const openReorderModal = () => {
    setDraftOrder(allCategoriesForReorder?.data ?? categories);
    setReorderDialogOpen(true);
  };

  const moveDraftItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draftOrder.length) return;
    const copy = [...draftOrder];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setDraftOrder(copy);
  };

  const handleSaveOrder = () => {
    reorderMutation.mutate(
      draftOrder.map((c) => c.id),
      {
        onSuccess: () => {
          toast.success("Updated POS terminal category sequence");
          setReorderDialogOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleExportCsv = () => {
    if (categories.length === 0) {
      toast.error("No categories available to export");
      return;
    }

    downloadCsv(
      "shop-crm-categories.csv",
      ["POS Order", "Category", "Slug", "Status", "Total SKUs", "Store Scope"],
      categories.map((c) => [
        c.posOrder,
        c.name,
        `/${c.slug}`,
        c.status,
        c.productCount,
        c.appliesToAllStores
          ? `All ${stores.length} Stores`
          : `${c.storeIds.length} Stores`,
      ]),
    );
    toast.success(`Exported ${categories.length} categories to CSV`);
  };

  const resolveStoreNames = (category: Category): string => {
    if (category.appliesToAllStores) {
      return stores.map((s) => s.name).join(", ");
    }
    const matched = stores
      .filter((s) => category.storeIds.includes(s.id))
      .map((s) => s.name);
    return matched.length > 0 ? matched.join(", ") : "No stores assigned";
  };

  if (isError) {
    return (
      <ErrorState
        title="Unable to load categories"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const allSelected =
    categories.length > 0 &&
    categories.every((c) => selectedIds.includes(c.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Sticky Context Header matching Stitch Screen 2 */}
      <PageHeader
        title="Categories Management"
        description="Organize and structure your retail catalog across all stores.
            Categories determine storefront navigation, POS quick-keys, and
            inventory reporting."
        actions={<QuickActionsMenu actions={createActions} />}
      />

      {/* Metric Strip & High Density Filter Bar matching Stitch Screen 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="flex flex-col items-stretch gap-2.5 p-2.5 sm:flex-row sm:items-center lg:col-span-8">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search categories by name, slug, or description..."
              className="pl-9 pr-8 bg-background border-transparent focus-visible:bg-card"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateUrlParams({ search: null, page: "1" });
                }}
                aria-label="Clear search"
                className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Control */}
          <div className="inline-flex items-center rounded-lg bg-secondary p-1 text-xs shrink-0 tabular-nums">
            <button
              type="button"
              onClick={() => updateUrlParams({ occupancy: null, page: "1" })}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap",
                occupancyParam === "ALL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All ({counts?.all ?? 0})
            </button>
            <button
              type="button"
              onClick={() =>
                updateUrlParams({ occupancy: "WITH_PRODUCTS", page: "1" })
              }
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap",
                occupancyParam === "WITH_PRODUCTS"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              With Products ({counts?.withProducts ?? 0})
            </button>
            <button
              type="button"
              onClick={() => updateUrlParams({ occupancy: "EMPTY", page: "1" })}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap",
                occupancyParam === "EMPTY"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Empty ({counts?.empty ?? 0})
            </button>
          </div>
        </Card>

        {/* Assigned Catalog Mini-Stat Card with SVG Sparkline */}
        <Card className="flex items-center justify-between px-4 py-3 lg:col-span-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-high text-brand-navy">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                Assigned Catalog
              </span>
              <div className="text-base font-semibold text-foreground tabular-nums">
                {formatNumber(counts?.totalAssignedSkus ?? 0)} SKUs
              </div>
            </div>
          </div>

          <svg
            className="h-7 w-20 overflow-visible text-primary"
            fill="none"
            viewBox="0 0 80 28"
            aria-hidden="true"
          >
            <path
              d="M0 22 C 12 22, 16 10, 28 10 C 40 10, 48 18, 60 4 C 70 4, 74 12, 80 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <circle className="fill-primary" cx="60" cy="4" r="3" />
          </svg>
        </Card>
      </div>

      {/* Categories Data Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories match your filter"
            description="Try clearing your search filter or create a new catalog category."
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
                      occupancy: null,
                      page: "1",
                    });
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setFormDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Category
                </Button>
              </div>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(categories.map((c) => c.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    aria-label="Select all categories"
                  />
                </TableHead>
                <TableHead className="w-16 text-center">POS</TableHead>
                <TableHead>Category Hierarchy</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead>Store Scope</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                const isInactive = category.status === "INACTIVE";

                return (
                  <TableRow
                    key={category.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(isInactive && "bg-background/60")}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, category.id]
                              : prev.filter((id) => id !== category.id),
                          );
                        }}
                        aria-label={`Select ${category.name}`}
                      />
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-accent font-mono text-xs font-semibold text-brand-navy tabular-nums">
                        {category.posOrder}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            isInactive
                              ? "bg-secondary text-muted-foreground"
                              : "bg-accent-high text-brand-navy",
                          )}
                        >
                          <CategoryIcon iconKey={category.iconKey} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/categories/${category.id}`}
                              className="truncate text-sm font-semibold text-foreground hover:text-primary"
                            >
                              {category.name}
                            </Link>
                            {isInactive && (
                              <StatusBadge
                                variant="secondary"
                                className="text-[10px] py-0"
                              >
                                Inactive
                              </StatusBadge>
                            )}
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            /{category.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <p className="truncate text-[13px] text-muted-foreground">
                        {category.description ?? "No description provided."}
                      </p>
                    </TableCell>

                    <TableCell className="text-right tabular-nums">
                      {category.productCount > 0 ? (
                        <Link
                          href={`/products?categoryId=${category.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-accent/60 px-2.5 py-0.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-accent-high"
                        >
                          <span>{category.productCount}</span>
                          <span className="font-normal text-muted-foreground">
                            SKUs
                          </span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                          0 SKUs
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {category.appliesToAllStores ? (
                        <StatusBadge variant="navy" className="tabular-nums">
                          All {stores.length} Stores
                        </StatusBadge>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <StatusBadge
                            variant="outline"
                            className="tabular-nums"
                          >
                            {category.storeIds.length} Store
                            {category.storeIds.length === 1 ? "" : "s"}
                          </StatusBadge>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="View assigned stores"
                                  className="text-muted-foreground hover:text-foreground cursor-help"
                                />
                              }
                            >
                              <Info className="h-3.5 w-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {resolveStoreNames(category)}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {category.productCount > 0 ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View category details & SKUs"
                            nativeButton={false}
                            render={
                              <Link href={`/categories/${category.id}`} />
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View empty category"
                            nativeButton={false}
                            render={
                              <Link href={`/categories/${category.id}`} />
                            }
                          >
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Quick edit category"
                          onClick={() => {
                            setEditingCategory(category);
                            setFormDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Delete category"
                          onClick={() => setDeletingCategory(category)}
                          className="hover:bg-destructive-bg hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {response?.meta && (
          <PaginationBar
            meta={response.meta}
            itemLabel="categories"
            onPageChange={(nextPage) =>
              updateUrlParams({ page: String(nextPage) })
            }
            onPageSizeChange={(nextSize) =>
              updateUrlParams({ pageSize: String(nextSize), page: "1" })
            }
          />
        )}
      </Card>

      {/* Hierarchical Sync Behavior Note & Batch Actions matching Stitch Screen 2 */}
      <Card className="flex flex-col justify-between gap-4 bg-accent/55 p-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Hierarchical Sync Behavior
            </h2>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
              POS sequence priority determines the primary quick-key tab
              arrangement in your in-store Point of Sale terminals across
              assigned locations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAuditLogOpen(true)}
          >
            <History className="h-3.5 w-3.5" />
            Audit Log
          </Button>
        </div>
      </Card>

      {/* Quick Create / Edit Category Modal */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        stores={stores}
        editingCategory={editingCategory}
        nextPosOrder={(counts?.all ?? 8) + 1}
      />

      {/* Reorder POS Sequence Modal */}
      <Dialog open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reorder POS Category Hierarchy</DialogTitle>
            <DialogDescription>
              Adjust the tab sequence displayed on Point of Sale terminals.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {draftOrder.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent font-mono text-xs font-semibold text-brand-navy tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveDraftItem(idx, -1)}
                    aria-label={`Move ${cat.name} up`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === draftOrder.length - 1}
                    onClick={() => moveDraftItem(idx, 1)}
                    aria-label={`Move ${cat.name} down`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReorderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={reorderMutation.isPending}
              onClick={handleSaveOrder}
            >
              Save POS Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safe Deletion Guard & Destructive Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          {deletingCategory && deletingCategory.productCount > 0 ? (
            <>
              <AlertDialogHeader>
                <div className="mb-1 flex items-center gap-2.5 text-warning">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <AlertDialogTitle>
                    Cannot Delete &ldquo;{deletingCategory.name}&rdquo;
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  Safe deletion guard active:{" "}
                  <strong className="font-semibold text-foreground tabular-nums">
                    {deletingCategory.productCount} product SKU
                    {deletingCategory.productCount === 1 ? "" : "s"}
                  </strong>{" "}
                  still reference this category across your stores. Reassign or
                  remove those products before deleting this category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <Button
                  type="button"
                  onClick={() => {
                    const catId = deletingCategory.id;
                    setDeletingCategory(null);
                    router.push(`/products?categoryId=${catId}`);
                  }}
                >
                  View Referencing Products
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete Category &ldquo;{deletingCategory?.name}&rdquo;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This category has 0 assigned products. Store associations and
                  POS quick-key shortcuts for{" "}
                  <strong className="font-mono text-foreground">
                    /{deletingCategory?.slug}
                  </strong>{" "}
                  will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!deletingCategory) return;
                    deleteMutation.mutate(deletingCategory.id, {
                      onSuccess: () => {
                        toast.success(
                          `Deleted category "${deletingCategory.name}"`,
                        );
                        setDeletingCategory(null);
                      },
                      onError: (err) => {
                        toast.error(getErrorMessage(err));
                        setDeletingCategory(null);
                      },
                    });
                  }}
                >
                  Delete Category
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Audit Log Dialog */}
      <Dialog open={auditLogOpen} onOpenChange={setAuditLogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Catalog & Hierarchy Audit Log</DialogTitle>
            <DialogDescription>
              Recent category, SKU, and store configuration events.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 divide-y divide-border-subtle overflow-y-auto">
            {(activityLogs ?? []).map((log) => (
              <div key={log.id} className="py-2.5 text-xs">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>{log.entityName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {log.entityType}
                  </span>
                </div>
                <p className="mt-0.5 text-muted-foreground">{log.action}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(log.timestamp)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{log.actorName}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
