import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ProductDetailView } from "@/features/products/components/product-detail-view";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
      <ProductDetailView productId={id} />
    </Suspense>
  );
}
