"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { ProductStatusBadge } from "@/components/shared/status-badge";
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
import { getErrorMessage } from "@/lib/api/errors";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/i18n/formatters";
import { useDisplayCurrency } from "@/lib/i18n/preferences";
import { cn } from "@/lib/utils";
import { useCategoriesListQuery } from "@/features/categories/api/category.queries";
import { getProductBySku } from "../api/product.api";
import { useProductsListQuery } from "../api/product.queries";
import {
  ProductStatus,
  ProductSortField,
  PRODUCT_SORT_FIELDS,
  PRODUCT_STATUS_VALUES,
} from "../constants/product.constant";
import { Product } from "../types/product.type";
import { AdjustStockDialog, ProductDeleteDialog } from "./product-dialog";

export function ProductsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as AppLocale;
  const [currency] = useDisplayCurrency();
  const activeStoreId = useActiveStoreId();

  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "20") || 20),
  );
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const statusParam = searchParams.get("status");
  const parsedStatus =
    statusParam !== null &&
    statusParam !== "" &&
    !Number.isNaN(Number(statusParam))
      ? (Number(statusParam) as ProductStatus)
      : undefined;
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minPrice =
    minPriceParam !== null &&
    minPriceParam !== "" &&
    !Number.isNaN(Number(minPriceParam))
      ? Number(minPriceParam)
      : undefined;
  const maxPrice =
    maxPriceParam !== null &&
    maxPriceParam !== "" &&
    !Number.isNaN(Number(maxPriceParam))
      ? Number(maxPriceParam)
      : undefined;
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";
  const sortByParam = searchParams.get("sortBy");
  const sortBy: ProductSortField = (
    PRODUCT_SORT_FIELDS as readonly string[]
  ).includes(sortByParam ?? "")
    ? (sortByParam as ProductSortField)
    : "createdAt";
  const sortOrder: "asc" | "desc" =
    searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const [searchInput, setSearchInput] = useState(search);
  const [skuLookupInput, setSkuLookupInput] = useState("");
  const [skuSearching, setSkuSearching] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(
    null,
  );
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = (
    updates: Record<string, string | number | boolean | undefined>,
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput.trim() !== search) {
        updateParams({ search: searchInput.trim() || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const productsQuery = useProductsListQuery({
    page,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    status: parsedStatus,
    minPrice,
    maxPrice,
    lowStockOnly: lowStockOnly || undefined,
    sortBy,
    sortOrder,
  });

  const categoriesQuery = useCategoriesListQuery(
    { page: 1, limit: 100 },
    Boolean(activeStoreId),
  );
  const categoryNameById = new Map<string, string>(
    (categoriesQuery.data?.items ?? []).map((cat) => [cat.id, cat.name]),
  );

  const handleSkuLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const sku = skuLookupInput.trim();
    if (!sku) return;
    setSkuSearching(true);
    try {
      const found = await getProductBySku(sku);
      router.push(`/products/${found.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    } finally {
      setSkuSearching(false);
    }
  };

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {tProducts("title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            {tProducts("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={handleSkuLookup}
            className="flex items-center gap-1.5"
          >
            <Input
              value={skuLookupInput}
              onChange={(e) => setSkuLookupInput(e.target.value)}
              placeholder={tProducts("skuLookupPlaceholder")}
              className="w-44 font-mono text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={skuSearching}
            >
              {tProducts("skuLookup")}
            </Button>
          </form>

          <Button
            render={
              <Link href="/products/new">
                <Plus className="h-4 w-4" />
                <span>{tProducts("createProduct")}</span>
              </Link>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={tProducts("searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <Select
            value={categoryId || "all"}
            onValueChange={(value) => {
              if (value === null) return;

              updateParams({
                categoryId: value === "all" ? undefined : value,
                page: 1,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tProducts("allCategories")}</SelectItem>
              {(categoriesQuery.data?.items ?? []).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={parsedStatus !== undefined ? String(parsedStatus) : "all"}
            onValueChange={(value) => {
              if (value === null) return;

              updateParams({
                status: value === "all" ? undefined : value,
                page: 1,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tProducts("allStatuses")}</SelectItem>
              {PRODUCT_STATUS_VALUES.map((statusVal) => (
                <SelectItem key={statusVal} value={String(statusVal)}>
                  {tProducts(`status.${statusVal}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}:${sortOrder}`}
            onValueChange={(value) => {
              if (value === null) return;

              const [nextSortBy, nextSortOrder] = value.split(":");
              updateParams({
                sortBy: nextSortBy,
                sortOrder: nextSortOrder,
                page: 1,
              });
            }}
          >
            <SelectTrigger>
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

          <Button
            type="button"
            variant={lowStockOnly ? "default" : "outline"}
            onClick={() =>
              updateParams({
                lowStockOnly: lowStockOnly ? undefined : "true",
                page: 1,
              })
            }
            className={cn(!lowStockOnly && "text-muted")}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{tProducts("lowStockOnly")}</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {productsQuery.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : productsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              error={productsQuery.error}
              onRetry={() => void productsQuery.refetch()}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title={tProducts("empty.title")}
              description={tProducts("empty.description")}
              action={
                <Button
                  render={
                    <Link href="/products/new">
                      <Plus className="h-4 w-4" />
                      <span>{tProducts("createProduct")}</span>
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
                <TableHead>{tProducts("columns.product")}</TableHead>
                <TableHead>{tProducts("columns.category")}</TableHead>
                <TableHead className="text-right">
                  {tProducts("columns.price")}
                </TableHead>
                <TableHead className="text-right">
                  {tProducts("columns.stock")}
                </TableHead>
                <TableHead>{tProducts("columns.status")}</TableHead>
                <TableHead>{tProducts("columns.updatedAt")}</TableHead>
                <TableHead className="text-right">
                  {tProducts("columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLowStock =
                  product.stockQuantity <= product.lowStockThreshold;
                const categoryName =
                  categoryNameById.get(product.categoryId) ??
                  product.categoryId;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-navy">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${product.id}`}
                            className="block truncate font-semibold text-ink hover:text-action"
                          >
                            {product.name}
                          </Link>
                          <p className="truncate font-mono text-xs text-muted">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-ink">
                      <Link
                        href={`/categories/${product.categoryId}`}
                        className="hover:text-action hover:underline"
                      >
                        {categoryName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      <span className="font-semibold text-ink">
                        {formatCurrency(product.price, locale, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="inline-flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            isLowStock ? "text-warning" : "text-ink",
                          )}
                        >
                          {formatNumber(product.stockQuantity, locale)}
                        </span>
                        {isLowStock ? (
                          <Badge variant="warning">
                            {tProducts("lowStockBadge")}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted tabular-nums">
                      {formatDateTime(product.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustingProduct(product)}
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                          <span>{tProducts("adjustStock")}</span>
                        </Button>
                        <Button
                          render={
                            <Link href={`/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          }
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tCommon("actions.view")}
                        />
                        <Button
                          render={
                            <Link href={`/products/${product.id}/edit`}>
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
                          onClick={() => setDeletingProduct(product)}
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

      <AdjustStockDialog
        product={adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />

      <ProductDeleteDialog
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}
