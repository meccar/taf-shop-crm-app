"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Edit, Eye, FolderTree, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { CategoryStatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

import { CategoryDeleteDialog } from "./category-dialogs";
import { useCategoriesListQuery } from "../api/category.queries";
import {
  CategoryStatus,
  CategorySortField,
  CATEGORY_SORT_FIELDS,
  CATEGORY_STATUS_VALUES,
} from "../constants/categories.constant";
import { Category } from "../types/category.type";

export function CategoriesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as AppLocale;
  const activeStoreId = useActiveStoreId();

  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");

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
      ? (Number(statusParam) as CategoryStatus)
      : undefined;
  const sortByParam = searchParams.get("sortBy");
  const sortBy: CategorySortField = (
    CATEGORY_SORT_FIELDS as readonly string[]
  ).includes(sortByParam ?? "")
    ? (sortByParam as CategorySortField)
    : "createdAt";
  const sortOrder: "asc" | "desc" =
    searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const [searchInput, setSearchInput] = useState(search);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

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

  const categoriesQuery = useCategoriesListQuery({
    page,
    limit,
    search: search || undefined,
    status: parsedStatus,
    sortBy,
    sortOrder,
  });

  const allCategoriesLookup = useCategoriesListQuery(
    { page: 1, limit: 100 },
    Boolean(activeStoreId),
  );
  const nameById = new Map<string, string>(
    (allCategoriesLookup.data?.items ?? []).map((item) => [item.id, item.name]),
  );

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

  const categories = categoriesQuery.data?.items ?? [];
  const meta = categoriesQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {tCategories("title")}
            </h1>
            {meta ? (
              <Badge variant="outline" className="tabular-nums">
                {tCategories("totalBadge", { count: meta.total })}
              </Badge>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm text-muted">
            {tCategories("subtitle")}
          </p>
        </div>

        <Button
          render={
            <Link href="/categories/new">
              <Plus className="h-4 w-4" />
              <span>{tCategories("createCategory")}</span>
            </Link>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={tCategories("searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <div
            role="tablist"
            aria-label={tCategories("fields.status")}
            className="inline-flex items-center rounded-lg border border-line bg-canvas p-1"
          >
            <Button
              type="button"
              role="tab"
              aria-selected={parsedStatus === undefined}
              onClick={() => updateParams({ status: undefined, page: 1 })}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                parsedStatus === undefined
                  ? "bg-surface text-ink shadow-xs"
                  : "text-muted hover:text-ink",
              )}
            >
              {tCategories("allStatuses")}
            </Button>
            {CATEGORY_STATUS_VALUES.map((statusVal) => {
              const selected = parsedStatus === statusVal;
              return (
                <Button
                  key={statusVal}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() =>
                    updateParams({ status: String(statusVal), page: 1 })
                  }
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                    selected
                      ? "bg-surface text-ink shadow-xs"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {tCategories(`status.${statusVal}`)}
                </Button>
              );
            })}
          </div>
        </div>

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
          <SelectTrigger className="w-full lg:w-52">
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
            <SelectItem value="updatedAt:asc">
              {tCommon("sort.updatedAt")} ({tCommon("sort.asc")})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {categoriesQuery.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={5} />
          </div>
        ) : categoriesQuery.isError ? (
          <div className="p-4">
            <ErrorState
              error={categoriesQuery.error}
              onRetry={() => void categoriesQuery.refetch()}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FolderTree}
              title={tCategories("empty.title")}
              description={tCategories("empty.description")}
              action={
                <Button
                  render={
                    <Link href="/categories/new">
                      <Plus className="h-4 w-4" />
                      <span>{tCategories("createCategory")}</span>
                    </Link>
                  }
                />
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCategories("columns.hierarchy")}</TableHead>
                <TableHead>{tCategories("columns.parent")}</TableHead>
                <TableHead>{tCategories("columns.description")}</TableHead>
                <TableHead>{tCategories("columns.status")}</TableHead>
                <TableHead>{tCategories("columns.updatedAt")}</TableHead>
                <TableHead className="text-right">
                  {tCategories("columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const parentName = category.parentId
                  ? (nameById.get(category.parentId) ?? category.parentId)
                  : null;
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-navy">
                          <FolderTree className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/categories/${category.id}`}
                            className="block truncate font-semibold text-ink hover:text-action"
                          >
                            {category.name}
                          </Link>
                          <p className="truncate font-mono text-xs text-muted">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted">
                      {parentName ? (
                        category.parentId ? (
                          <Link
                            href={`/categories/${category.parentId}`}
                            className="font-medium text-ink hover:text-action"
                          >
                            {parentName}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink">
                            {parentName}
                          </span>
                        )
                      ) : (
                        tCategories("rootOnly")
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm text-muted">
                        {category.description || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <CategoryStatusBadge status={category.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted tabular-nums">
                      {formatDateTime(category.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          render={
                            <Link href={`/categories/${category.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          }
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tCommon("actions.view")}
                        />
                        <Button
                          render={
                            <Link href={`/categories/${category.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          }
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tCommon("actions.edit")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tCommon("actions.delete")}
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

      <CategoryDeleteDialog
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  );
}
