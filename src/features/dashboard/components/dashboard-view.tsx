"use client";

import { ArrowRight, FolderTree, Package, Plus, Store } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StoreStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDateTime, formatNumber } from "@/lib/i18n/formatters";
import { useDashboardOverviewQuery } from "../api/dashboard.queries";
import { useCategoriesListQuery } from "@/features/categories/api/category.queries";
import { useProductsListQuery } from "@/features/products/api/product.queries";
import { useStoresListQuery } from "@/features/stores/api/store.queries";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const locale = useLocale() as AppLocale;
  const activeStoreId = useActiveStoreId();
  const t = useTranslations("dashboard");

  const storesQuery = useStoresListQuery({ page: 1, limit: 20 });
  const categoriesQuery = useCategoriesListQuery(
    { page: 1, limit: 1 },
    Boolean(activeStoreId),
  );
  const productsQuery = useProductsListQuery(
    { page: 1, limit: 1 },
    Boolean(activeStoreId),
  );
  const overviewQuery = useDashboardOverviewQuery();

  const stores = storesQuery.data?.items ?? [];
  const activeStore = stores.find((item) => item.id === activeStoreId) ?? null;

  const overview = overviewQuery.data?.data ?? null;
  const overviewMocked = overviewQuery.data?.isMocked ?? false;

  const storesTotal =
    overview?.storesTotal ?? storesQuery.data?.meta.total ?? null;
  const categoriesTotal =
    overview?.categoriesTotal ?? categoriesQuery.data?.meta.total ?? null;
  const productsTotal =
    overview?.productsTotal ?? productsQuery.data?.meta.total ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/stores/new">
                <Plus className="h-4 w-4" />
                <span>{t("quickActions.createStore")}</span>
              </Link>
            }
            variant="outline"
          />
          {activeStore ? (
            <>
              <Button
                nativeButton={false}
                render={
                  <Link href="/categories/new">
                    <Plus className="h-4 w-4" />
                    <span>{t("quickActions.createCategory")}</span>
                  </Link>
                }
                variant="outline"
              />
              <Button
                nativeButton={false}
                render={
                  <Link href="/products/new">
                    <Plus className="h-4 w-4" />
                    <span>{t("quickActions.createProduct")}</span>
                  </Link>
                }
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Real backend-derived or optional overview KPIs (never fabricated) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("kpis.storesTotal")}
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">
              {storesTotal !== null ? formatNumber(storesTotal, locale) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("kpis.categoriesTotal")}
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">
              {categoriesTotal !== null
                ? formatNumber(categoriesTotal, locale)
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("kpis.productsTotal")}
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">
              {productsTotal !== null
                ? formatNumber(productsTotal, locale)
                : "—"}
            </p>
          </CardContent>
        </Card>

        {overview ? (
          <Card>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {t("kpis.lowStockCount")}
                </p>
                <p className="mt-1.5 text-2xl font-semibold text-warning tabular-nums">
                  {formatNumber(overview.lowStockCount, locale)}
                </p>
              </div>
              {overviewMocked ? (
                <Badge variant="warning">{t("mockTag")}</Badge>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t("activeStoreCard")}
              </p>
              <p className="mt-1.5 truncate text-base font-semibold text-ink">
                {activeStore ? activeStore.name : t("noStoreSelected")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("activeStoreCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeStore ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">
                        {activeStore.name}
                      </h2>
                      <Badge variant="store" className="font-mono">
                        {activeStore.code}
                      </Badge>
                      <StoreStatusBadge status={activeStore.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {activeStore.address}, {activeStore.cityStateZip}
                    </p>
                  </div>

                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/stores/${activeStore.id}`}>
                        <span>{t("openStores")}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    }
                    variant="outline"
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-3">
                  <Link
                    href="/stores"
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink hover:border-line-strong transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-navy" />
                      <span>{t("openStores")}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink hover:border-line-strong transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-navy" />
                      <span>{t("openCategories")}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink hover:border-line-strong transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-navy" />
                      <span>{t("openProducts")}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">{t("noStoreSelected")}</p>
                <Button
                  nativeButton={false}
                  render={<Link href="/stores">{t("openStores")}</Link>}
                  size="sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {overview ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t("recentActivity.title")}</CardTitle>
              {overviewMocked ? (
                <Badge variant="warning">{t("mockTag")}</Badge>
              ) : null}
            </CardHeader>
            <CardContent>
              {overview.recentActivity.length === 0 ? (
                <p className="text-sm text-muted">
                  {t("recentActivity.empty")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {overview.recentActivity.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 border-b border-line pb-2.5 last:border-0 last:pb-0"
                    >
                      <span className="text-xs font-medium text-action">
                        {t(`recentActivity.types.${item.type}`)}
                      </span>
                      <span className="text-sm text-ink">{item.title}</span>
                      <span className="text-xs text-muted tabular-nums">
                        {formatDateTime(item.timestamp, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
