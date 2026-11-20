"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { StoreForm } from "./store-form";
import { useStoreDetailQuery } from "../api/store.queries";

export function StoreEditView({ storeId }: { storeId: string }) {
  const router = useRouter();
  const detailQuery = useStoreDetailQuery(storeId);

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
    <StoreForm
      key={detailQuery.data.id}
      store={detailQuery.data}
      onSuccess={(saved) => router.replace(`/stores/${saved.id}`)}
    />
  );
}
