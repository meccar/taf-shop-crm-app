import { Skeleton } from "@/components/ui/skeleton";
import { EditProductPageView } from "@/features/products/components/product-page-views";
import { Suspense } from "react";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

async function EditProductContent({ params }: EditProductPageProps) {
  const { productId } = await params;
  return <EditProductPageView productId={productId} />;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
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
      <EditProductContent params={params} />;
    </Suspense>
  );
}
