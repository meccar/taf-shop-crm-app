import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ProductsView } from "@/features/products/components/products-view";

export default function ProductsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
      <ProductsView />
    </Suspense>
  );
}
