import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoresManagementView } from "@/features/stores/components/stores-management-view";

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      }
    >
      <StoresManagementView />
    </Suspense>
  );
}
