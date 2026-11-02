"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  Package,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/categories/api/category.queries";
import { useProducts } from "@/features/products/api/product.queries";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
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
import { CategoryIcon } from "@/components/shared/category-icon";
import { ProductThumbnail } from "@/components/shared/product-thumbnail";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CategoryForm } from "@/features/categories/components/category-form";

export function CategoryDetailView({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { activeStoreId, activeStore, stores } = useActiveStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const {
    data: category,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategory(categoryId, activeStoreId);

  const { data: activeStoreProducts } = useProducts({
    storeId: activeStoreId,
    categoryId,
    page: 1,
    pageSize: 20,
  });

  const deleteMutation = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <ErrorState
        title="Category not found"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const scopedStores = category.appliesToAllStores
    ? stores
    : stores.filter((s) => category.storeIds.includes(s.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Categories
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-high text-brand-navy">
              <CategoryIcon iconKey={category.iconKey} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {category.name}
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              /{category.slug}
            </span>
            <StatusBadge
              variant={category.status === "ACTIVE" ? "success" : "secondary"}
            >
              POS #{category.posOrder} · {category.status}
            </StatusBadge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.description ?? "No category description configured."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            nativeButton={false}
            render={<Link href={`/categories/${category.id}/edit`} />}
          >
            <Edit className="h-4 w-4" />
            Edit Category
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scope & Counts Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Network SKU References
          </span>
          <div className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
            {category.productCount} SKUs
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Across all provisioned retail stores
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            SKUs in {activeStore?.name ?? "Active Store"}
          </span>
          <div className="mt-1 text-2xl font-semibold text-primary tabular-nums">
            {category.activeStoreProductCount} SKUs
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Scoped to {activeStore?.code}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned Store Availability ({scopedStores.length})
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scopedStores.map((s) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground hover:border-primary"
              >
                <StoreIcon className="h-3 w-3 text-primary" />
                {s.code}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Products in Active Store for this Category */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Products in {activeStore?.name ?? "Active Store"}
            </h2>
            <p className="text-xs text-muted-foreground">
              SKUs mapped to /{category.slug} in the active store context
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/products?categoryId=${category.id}`} />}
            size="sm"
          >
            Filter in Catalog
          </Button>
        </div>

        {(activeStoreProducts?.data.length ?? 0) === 0 ? (
          <EmptyState
            icon={Package}
            title="No products in this category for the active store"
            description={`Switch active store context or add a product under "${category.name}".`}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeStoreProducts?.data.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumbnail
                        imageUrl={prod.imageUrl}
                        name={prod.name}
                        size="sm"
                      />
                      <Link
                        href={`/products/${prod.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {prod.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {prod.sku}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(prod.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.stockQuantity} units
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          {category.productCount > 0 ? (
            <>
              <AlertDialogHeader>
                <div className="mb-1 flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertDialogTitle>
                    Deletion Blocked — {category.productCount} SKUs Assigned
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  &ldquo;{category.name}&rdquo; is still referenced by{" "}
                  {category.productCount} product(s). Reassign or delete those
                  products before removing this category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete Category &ldquo;{category.name}&rdquo;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently remove /{category.slug} from your catalog
                  hierarchy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMutation.mutate(category.id, {
                      onSuccess: () => {
                        toast.success(`Deleted category "${category.name}"`);
                        router.push("/categories");
                      },
                      onError: (err) => toast.error(getErrorMessage(err)),
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
    </div>
  );
}

export function CreateCategoryPageView() {
  const router = useRouter();
  const { stores } = useActiveStore();
  const { data: categoriesList } = useCategories({ page: 1, pageSize: 100 });
  const createMutation = useCreateCategory();

  const handleCreate = (values: CategoryFormValues) => {
    createMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Created category "${created.name}"`);
        router.push(`/categories/${created.id}`);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Create Catalog Category
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure POS quick-key order, URL slug, and multi-store availability.
        </p>
      </div>

      <Card className="p-6">
        <CategoryForm
          stores={stores}
          defaultPosOrder={(categoriesList?.counts.all ?? 8) + 1}
          isSubmitting={createMutation.isPending}
          submitLabel="Save Category"
          onSubmit={handleCreate}
          onCancel={() => router.push("/categories")}
        />
      </Card>
    </div>
  );
}

export function EditCategoryPageView({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { stores } = useActiveStore();
  const {
    data: category,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategory(categoryId);
  const updateMutation = useUpdateCategory();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <ErrorState
        title="Unable to load category for editing"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const handleUpdate = (values: CategoryFormValues) => {
    updateMutation.mutate(
      { categoryId: category.id, payload: values },
      {
        onSuccess: (updated) => {
          toast.success(`Saved changes to "${updated.name}"`);
          router.push(`/categories/${updated.id}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/categories/${category.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {category.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Edit Category · {category.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modify category slug, POS tab ordering, and assigned retail stores.
        </p>
      </div>

      <Card className="p-6">
        <CategoryForm
          stores={stores}
          initialData={category}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Category Changes"
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/categories/${category.id}`)}
        />
      </Card>
    </div>
  );
}
