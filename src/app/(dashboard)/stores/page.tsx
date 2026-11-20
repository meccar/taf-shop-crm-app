import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { StoresView } from "@/features/stores/components/stores-view";

export default function StoresPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
      <StoresView />
    </Suspense>
  );
}
