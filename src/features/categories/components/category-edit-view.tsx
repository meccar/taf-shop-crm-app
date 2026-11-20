"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { CategoryForm } from "./category-form";
import { useCategoryDetailQuery } from "../api/category.queries";

export function CategoryEditView({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const activeStoreId = useActiveStoreId();
  const detailQuery = useCategoryDetailQuery(categoryId);

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

  if (detailQuery.isLoading) {
    return <TableSkeleton rows={4} columns={3} />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ErrorState
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  return (
    <CategoryForm
      category={detailQuery.data}
      onSuccess={(saved) => router.replace(`/categories/${saved.id}`)}
    />
  );
}
