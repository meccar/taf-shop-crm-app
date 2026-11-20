"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { ProductForm } from "./product-form";
import { useProductDetailQuery } from "../api/product.queries";

export function ProductEditView({ productId }: { productId: string }) {
  const router = useRouter();
  const activeStoreId = useActiveStoreId();
  const productQuery = useProductDetailQuery(productId);

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

  return (
    <ProductForm
      product={productQuery.data}
      onSuccess={(saved) => router.replace(`/products/${saved.id}`)}
    />
  );
}
