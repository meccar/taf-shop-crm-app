import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetailView } from "@/features/products/components/product-page-views";
import { Suspense } from "react";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  return <ProductDetailView productId={productId} />;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
