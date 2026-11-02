"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  FolderTree,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useDeleteStore,
  useStore,
  useUpdateStore,
} from "@/features/stores/api/store.queries";
import { useProducts } from "@/features/products/api/product.queries";
import { useCategories } from "@/features/categories/api/category.queries";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

interface StoreDetailViewProps {
  storeId: string;
}

export function StoreDetailView({ storeId }: StoreDetailViewProps) {
  const router = useRouter();
  const { activeStoreId, setActiveStoreId } = useActiveStore();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const { data: store, isLoading, isError, error, refetch } = useStore(storeId);

  const { data: productsData } = useProducts({
    storeId,
    page: 1,
    pageSize: 8,
  });

  const { data: categoriesData } = useCategories({
    storeId,
    page: 1,
    pageSize: 50,
  });

  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <ErrorState
        title="Store not found"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const assignedCategories = (categoriesData?.data ?? []).filter(
    (c) => c.appliesToAllStores || c.storeIds.includes(store.id),
  );

  const isCurrentContext = store.id === activeStoreId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Stores
          </Link>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {store.name}
            </h1>
            <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-brand-navy tabular-nums">
              {store.code}
            </span>
            <StatusBadge
              variant={store.status === "ACTIVE" ? "success" : "secondary"}
            >
              {store.status === "ACTIVE"
                ? "Active POS"
                : "Inactive (Setup Phase)"}
            </StatusBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            {store.description ?? `${store.format} retail node`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isCurrentContext && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setActiveStoreId(store.id);
                toast.success(`Switched active store context to ${store.name}`);
              }}
            >
              <StoreIcon className="h-4 w-4" />
              Set Active Context
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={updateStoreMutation.isPending}
            onClick={() => {
              const nextStatus =
                store.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              updateStoreMutation.mutate(
                { storeId: store.id, payload: { status: nextStatus } },
                {
                  onSuccess: () =>
                    toast.success(`Store status updated to ${nextStatus}`),
                },
              );
            }}
          >
            {store.status === "ACTIVE" ? "Deactivate POS" : "Activate POS"}
          </Button>
          <Button
            variant="default"
            nativeButton={false}
            render={<Link href={`/stores/${store.id}/edit`} />}
          >
            <Edit className="h-4 w-4" />
            Edit Store
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Store Summary Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">
            Location & Operational Profile
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-[13px]">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Physical Address
              </span>
              <p className="flex items-start gap-1.5 font-medium text-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {store.address}
                  <br />
                  <span className="font-normal text-muted-foreground">
                    {store.cityStateZip}
                  </span>
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Primary Manager
              </span>
              <p className="font-medium text-foreground">{store.managerName}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {store.managerEmail}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Store Contact
              </span>
              <p className="flex items-center gap-1.5 text-foreground">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {store.phone ?? "Not configured"}
              </p>
              {store.email && (
                <p className="text-xs text-muted-foreground">{store.email}</p>
              )}
            </div>

            <div className="space-y-1 tabular-nums">
              <span className="text-xs text-muted-foreground">
                POS Tax Rate & Format
              </span>
              <p className="font-medium text-foreground">
                {store.taxRate.toFixed(2)}% Sales Tax · {store.format}
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated {formatRelativeTime(store.updatedAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Catalog Coverage
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 tabular-nums">
              <div className="rounded-lg border border-border bg-background p-3">
                <span className="text-[11px] text-muted-foreground">
                  Assigned SKUs
                </span>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {formatNumber(store.skuCount)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <span className="text-[11px] text-muted-foreground">
                  In-Stock Rate
                </span>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {store.skuCount > 0 ? `${store.inStockRate}%` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <span className="text-xs font-medium text-muted-foreground">
              Mapped Categories ({assignedCategories.length})
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {assignedCategories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground hover:border-primary"
                >
                  <FolderTree className="h-3 w-3 text-primary" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Store Products Preview */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Store Product Catalog ({store.skuCount})
            </h2>
            <p className="text-xs text-muted-foreground">
              Products directly assigned to {store.name}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setActiveStoreId(store.id);
              router.push("/products/new");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Product to Store
          </Button>
        </div>

        {(productsData?.data.length ?? 0) === 0 ? (
          <EmptyState
            icon={Package}
            title="No products assigned to this store"
            description="Switch to this store context and add products to begin POS inventory tracking."
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setActiveStoreId(store.id);
                  router.push("/products/new");
                }}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsData?.data.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumbnail
                        imageUrl={prod.imageUrl}
                        name={prod.name}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/products/${prod.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {prod.name}
                        </Link>
                        <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {prod.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {prod.categoryName}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(prod.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.stockQuantity} units
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href={`/products/${prod.id}`} />}
                      size="sm"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {store.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting {store.code} removes this store location and its{" "}
              {store.skuCount} store-scoped product records permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteStoreMutation.mutate(store.id, {
                  onSuccess: () => {
                    toast.success(`Deleted store ${store.name}`);
                    router.push("/stores");
                  },
                  onError: (err) => toast.error(getErrorMessage(err)),
                });
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
