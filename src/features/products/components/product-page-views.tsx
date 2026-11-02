"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  FolderTree,
  Minus,
  Plus,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useUpdateProduct,
} from "@/features/products/api/product.queries";
import { useCategories } from "@/features/categories/api/category.queries";
import { useStore } from "@/features/stores/api/store.queries";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
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
import { ErrorState } from "@/components/shared/error-state";
import { ProductForm } from "@/features/products/components/product-form";

export function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(productId);

  const { data: owningStore } = useStore(product?.storeId ?? "");
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <ErrorState
        title="Product not found"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const isOut = product.stockQuantity === 0;
  const isLow = !isOut && product.stockQuantity <= product.lowStockThreshold;

  const adjustStock = (delta: number) => {
    const nextQty = Math.max(0, product.stockQuantity + delta);
    updateMutation.mutate(
      { productId: product.id, payload: { stockQuantity: nextQty } },
      {
        onSuccess: () =>
          toast.success(`Updated stock to ${nextQty} units for ${product.sku}`),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-foreground tabular-nums">
              {product.sku}
            </span>
            <StatusBadge
              variant={
                product.status === "ACTIVE"
                  ? "success"
                  : product.status === "DRAFT"
                    ? "warning"
                    : "secondary"
              }
            >
              {product.status}
            </StatusBadge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            nativeButton={false}
            render={<Link href={`/products/${product.id}/edit`} />}
            size="sm"
          >
            <Edit className="h-4 w-4" />
            Edit Product
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6">
          <ProductThumbnail
            imageUrl={product.imageUrl}
            name={product.name}
            sku={product.sku}
            size="lg"
            className="h-48 w-48"
          />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(product.price)}
            </div>
            <span className="text-xs text-muted-foreground">
              Retail Unit Price
            </span>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Catalog Description & Specifications
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {product.description ??
                  "No extended product description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 text-[13px]">
              <div>
                <span className="text-xs text-muted-foreground">
                  Assigned Store Location
                </span>
                <p className="mt-0.5 flex items-center gap-1.5 font-medium text-foreground">
                  <StoreIcon className="h-3.5 w-3.5 text-primary" />
                  {owningStore ? (
                    <Link
                      href={`/stores/${owningStore.id}`}
                      className="hover:text-primary"
                    >
                      {owningStore.name} ({owningStore.code})
                    </Link>
                  ) : (
                    product.storeId
                  )}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">
                  Catalog Category
                </span>
                <p className="mt-0.5 flex items-center gap-1.5 font-medium text-foreground">
                  <FolderTree className="h-3.5 w-3.5 text-primary" />
                  <Link
                    href={`/categories/${product.categoryId}`}
                    className="hover:text-primary"
                  >
                    {product.categoryName}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Stock Control Strip */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center">
            <div className="tabular-nums">
              <span className="text-xs text-muted-foreground">
                On-Hand POS Inventory
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">
                  {product.stockQuantity} units
                </span>
                {isOut ? (
                  <StatusBadge variant="destructive">Out of Stock</StatusBadge>
                ) : isLow ? (
                  <StatusBadge variant="warning">
                    Low Stock (≤{product.lowStockThreshold})
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="success">Healthy</StatusBadge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Updated {formatRelativeTime(product.updatedAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  updateMutation.isPending || product.stockQuantity === 0
                }
                onClick={() => adjustStock(-1)}
              >
                <Minus className="h-3.5 w-3.5" />1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => adjustStock(1)}
              >
                <Plus className="h-3.5 w-3.5" />1
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => adjustStock(10)}
              >
                +10 Restock
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently remove SKU {product.sku} from this store catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(product.id, {
                  onSuccess: () => {
                    toast.success(`Deleted ${product.sku}`);
                    router.push("/products");
                  },
                  onError: (err) => toast.error(getErrorMessage(err)),
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

export function CreateProductPageView() {
  const router = useRouter();
  const { activeStore, activeStoreId } = useActiveStore();
  const { data: categoriesResponse, isLoading: loadingCategories } =
    useCategories({
      storeId: activeStoreId,
      page: 1,
      pageSize: 100,
    });
  const createMutation = useCreateProduct();

  if (!activeStore || loadingCategories) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const availableCategories = (categoriesResponse?.data ?? []).filter(
    (c) => c.appliesToAllStores || c.storeIds.includes(activeStore.id),
  );

  const handleCreate = (values: ProductFormValues) => {
    createMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Created SKU "${created.sku}" in ${activeStore.name}`);
        router.push(`/products/${created.id}`);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Add Store Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new retail SKU scoped to {activeStore.name} (
          {activeStore.code}
          ).
        </p>
      </div>

      <Card className="p-6">
        <ProductForm
          activeStore={activeStore}
          categories={availableCategories}
          isSubmitting={createMutation.isPending}
          submitLabel="Create Product"
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
        />
      </Card>
    </div>
  );
}

export function EditProductPageView({ productId }: { productId: string }) {
  const router = useRouter();
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(productId);
  const { data: owningStore } = useStore(product?.storeId ?? "");
  const { data: categoriesResponse } = useCategories({
    storeId: product?.storeId,
    page: 1,
    pageSize: 100,
  });
  const updateMutation = useUpdateProduct();

  if (isLoading || (product && !owningStore)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !product || !owningStore) {
    return (
      <ErrorState
        title="Unable to load product for editing"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const availableCategories = (categoriesResponse?.data ?? []).filter(
    (c) => c.appliesToAllStores || c.storeIds.includes(owningStore.id),
  );

  const handleUpdate = (values: ProductFormValues) => {
    updateMutation.mutate(
      { productId: product.id, payload: values },
      {
        onSuccess: (updated) => {
          toast.success(`Saved changes to ${updated.sku}`);
          router.push(`/products/${updated.id}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {product.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Edit Product · {product.sku}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update catalog pricing, SKU details, imagery, and inventory
          thresholds.
        </p>
      </div>

      <Card className="p-6">
        <ProductForm
          activeStore={owningStore}
          categories={availableCategories}
          initialData={product}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Product Changes"
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/products/${product.id}`)}
        />
      </Card>
    </div>
  );
}
