import { Skeleton } from "@/components/ui/skeleton";
import { EditStorePageView } from "@/features/stores/components/store-page-views";
import { Suspense } from "react";

interface EditStorePageProps {
  params: Promise<{ storeId: string }>;
}

async function EditStoreContent({ params }: EditStorePageProps) {
  const { storeId } = await params;
  return <EditStorePageView storeId={storeId} />;
}

export default function EditStorePage({ params }: EditStorePageProps) {
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
      <EditStoreContent params={params} />
    </Suspense>
  );
}
