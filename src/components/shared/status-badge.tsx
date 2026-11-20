"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CategoryStatus } from "@/features/categories/constants/categories.constant";
import { ProductStatus } from "@/features/products/constants/product.constant";
import { StoreStatus } from "@/features/stores/constants/store.constant";

export function StoreStatusBadge({ status }: { status: StoreStatus }) {
  const t = useTranslations("stores.status");

  const variant =
    status === StoreStatus.ACTIVE
      ? "success"
      : status === StoreStatus.PENDING
        ? "warning"
        : status === StoreStatus.INACTIVE
          ? "destructive"
          : "neutral";

  return <Badge variant={variant}>{t(String(status))}</Badge>;
}

export function CategoryStatusBadge({ status }: { status: CategoryStatus }) {
  const t = useTranslations("categories.status");

  const variant =
    status === CategoryStatus.ACTIVE
      ? "success"
      : status === CategoryStatus.INACTIVE
        ? "warning"
        : "neutral";

  return <Badge variant={variant}>{t(String(status))}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const t = useTranslations("products.status");

  const variant =
    status === ProductStatus.ACTIVE
      ? "success"
      : status === ProductStatus.DRAFT
        ? "warning"
        : status === ProductStatus.OUT_OF_STOCK
          ? "destructive"
          : "neutral";

  return <Badge variant={variant}>{t(String(status))}</Badge>;
}
