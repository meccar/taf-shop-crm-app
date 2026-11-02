import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsManagementView } from "@/features/products/components/products-management-view";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <ProductsManagementView />
    </Suspense>
  );
}
