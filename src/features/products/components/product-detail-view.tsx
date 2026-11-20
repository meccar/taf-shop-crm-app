"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/error-state";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/i18n/formatters";
import { useDisplayCurrency } from "@/lib/i18n/preferences";
import { ProductForm } from "./product-form";
import { useCategoriesListQuery } from "@/features/categories/api/category.queries";
import { useProductDetailQuery } from "../api/product.queries";
import { AdjustStockDialog, ProductDeleteDialog } from "./product-dialog";

export function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as AppLocale;
  const [currency] = useDisplayCurrency();
  const activeStoreId = useActiveStoreId();

  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");

  const isEditMode = searchParams.get("mode") === "edit";
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const productQuery = useProductDetailQuery(productId);
  const categoriesQuery = useCategoriesListQuery(
    { page: 1, limit: 100 },
    Boolean(activeStoreId),
  );

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

  if (productQuery.isLoading) {
    return <TableSkeleton rows={5} columns={3} />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;

  if (isEditMode) {
    return (
      <ProductForm
        product={product}
        onSuccess={() => router.replace(`/products/${product.id}`)}
      />
    );
  }

  const matchedCategory = categoriesQuery.data?.items.find(
    (cat) => cat.id === product.categoryId,
  );
  const categoryName = matchedCategory?.name ?? product.categoryId;
  const metadataEntries = product.metadata
    ? Object.entries(product.metadata)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            render={
              <Link href="/products">
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
              {product.name}
            </h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="font-mono text-xs text-muted">
            {product.sku} · /{product.slug}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdjustOpen(true)}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{tProducts("adjustStock")}</span>
          </Button>
          <Button
            render={
              <Link href={`/products/${product.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span>{tCommon("actions.edit")}</span>
              </Link>
            }
            variant="outline"
          />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{tProducts("viewProduct")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted">
                  {tProducts("fields.categoryId")}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  <Link
                    href={`/categories/${product.categoryId}`}
                    className="hover:text-action hover:underline"
                  >
                    {categoryName}
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">
                  {tProducts("columns.updatedAt")}
                </p>
                <p className="mt-1 text-sm text-ink tabular-nums">
                  {formatDateTime(product.updatedAt, locale)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted">
                {tProducts("fields.description")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {product.description || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted mb-2">
                {tProducts("fields.images")}
              </p>
              {product.images.length === 0 ? (
                <p className="text-sm text-muted">—</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.images.map((key) => (
                    <span
                      key={key}
                      className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-xs text-ink"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted mb-2">
                {tProducts("fields.metadata")}
              </p>
              {metadataEntries.length === 0 ? (
                <p className="text-sm text-muted">
                  {tProducts("fields.noMetadata")}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {metadataEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
                    >
                      <span className="font-mono text-xs text-muted">
                        {key}
                      </span>
                      <span className="font-medium text-ink">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tProducts("columns.price")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted">
                  {tProducts("fields.price")}
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-ink tabular-nums">
                  {formatCurrency(product.price, locale, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">
                  {tProducts("fields.costPrice")}
                </p>
                <p className="mt-1 font-mono text-sm text-ink tabular-nums">
                  {product.costPrice !== null && product.costPrice !== undefined
                    ? formatCurrency(product.costPrice, locale, currency)
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tProducts("columns.stock")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted">
                  {tProducts("fields.stockQuantity")}
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-ink tabular-nums">
                  {formatNumber(product.stockQuantity, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">
                  {tProducts("fields.lowStockThreshold")}
                </p>
                <p className="mt-1 font-mono text-sm text-ink tabular-nums">
                  {formatNumber(product.lowStockThreshold, locale)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AdjustStockDialog
        product={adjustOpen ? product : null}
        onClose={() => setAdjustOpen(false)}
      />

      <ProductDeleteDialog
        product={deleteOpen ? product : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.replace("/products")}
      />
    </div>
  );
}
