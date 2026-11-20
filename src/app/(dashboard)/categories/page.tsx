import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { CategoriesView } from "@/features/categories/components/categories-view";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <CategoriesView />
    </Suspense>
  );
}
