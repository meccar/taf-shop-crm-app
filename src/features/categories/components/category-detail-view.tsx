"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  FolderTree,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/error-state";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { CategoryStatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/i18n/formatters";
import { CategoryDeleteDialog } from "./category-dialogs";
import {
  useCategoryDetailQuery,
  useCategoriesListQuery,
} from "../api/category.queries";

export function CategoryDetailView({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const activeStoreId = useActiveStoreId();

  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const detailQuery = useCategoryDetailQuery(categoryId);
  const allCategoriesQuery = useCategoriesListQuery(
    { page: 1, limit: 100 },
    Boolean(activeStoreId),
  );
  const allItems = allCategoriesQuery.data?.items ?? [];
  const listedParentCategory = detailQuery.data?.parentId
    ? (allItems.find((item) => item.id === detailQuery.data?.parentId) ?? null)
    : null;
  const fallbackParentQuery = useCategoryDetailQuery(
    detailQuery.data?.parentId ?? "",
    Boolean(activeStoreId && detailQuery.data?.parentId) &&
      !listedParentCategory,
  );

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

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

  const category = detailQuery.data;
  const parentCategory =
    listedParentCategory ?? fallbackParentQuery.data ?? null;
  const childCategories = allItems.filter(
    (item) => item.parentId === category.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            render={
              <Link href="/categories">
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
              {category.name}
            </h1>
            <CategoryStatusBadge status={category.status} />
          </div>
          <p className="font-mono text-xs text-muted">/{category.slug}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            render={
              <Link
                href={`/products?categoryId=${encodeURIComponent(category.id)}`}
              >
                <ExternalLink className="h-4 w-4" />
                <span>{tCategories("viewProducts")}</span>
              </Link>
            }
            variant="outline"
          />
          <Button
            render={
              <Link href={`/categories/${category.id}/edit`}>
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

      <Card>
        <CardHeader>
          <CardTitle>{tCategories("viewCategory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted">
                {tCategories("fields.parentId")}
              </p>
              <div className="mt-1 text-sm font-medium text-ink">
                {parentCategory ? (
                  <Link
                    href={`/categories/${parentCategory.id}`}
                    className="text-action hover:underline"
                  >
                    {parentCategory.name}
                  </Link>
                ) : category.parentId ? (
                  <Link
                    href={`/categories/${category.parentId}`}
                    className="font-mono text-xs text-action hover:underline"
                  >
                    {category.parentId}
                  </Link>
                ) : (
                  <span className="text-muted">{tCategories("rootOnly")}</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted">
                {tCategories("fields.createdAt")}
              </p>
              <p className="mt-1 text-sm text-ink tabular-nums">
                {formatDateTime(category.createdAt, locale)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted">
                {tCategories("fields.updatedAt")}
              </p>
              <p className="mt-1 text-sm text-ink tabular-nums">
                {formatDateTime(category.updatedAt, locale)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted">
              {tCategories("fields.description")}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
              {category.description || "—"}
            </p>
          </div>

          {childCategories.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-muted mb-2">
                {tCategories("columns.hierarchy")} ({childCategories.length})
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.id}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-sm hover:border-line-strong hover:bg-surface-subtle/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderTree className="h-4 w-4 shrink-0 text-navy" />
                      <span className="truncate font-medium text-ink">
                        {child.name}
                      </span>
                    </div>
                    <CategoryStatusBadge status={child.status} />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CategoryDeleteDialog
        category={deleteOpen ? category : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.replace("/categories")}
      />
    </div>
  );
}
