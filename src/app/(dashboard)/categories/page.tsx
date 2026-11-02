import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesManagementView } from "@/features/categories/components/categories-management-view";

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <CategoriesManagementView />
    </Suspense>
  );
}
