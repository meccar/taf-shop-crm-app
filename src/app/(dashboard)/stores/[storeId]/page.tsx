import { Suspense } from "react";
import { StoreDetailView } from "@/features/stores/components/store-detail-view";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreDetailPageProps {
  params: Promise<{
    storeId: string;
  }>;
}

async function StoreDetailContent({ params }: StoreDetailPageProps) {
  const { storeId } = await params;
  return <StoreDetailView storeId={storeId} />;
}

export default function StoreDetailPage({ params }: StoreDetailPageProps) {
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
      <StoreDetailContent params={params} />
    </Suspense>
  );
}
