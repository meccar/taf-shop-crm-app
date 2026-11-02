import { Skeleton } from "@/components/ui/skeleton";
import { EditCategoryPageView } from "@/features/categories/components/category-page-views";
import { Suspense } from "react";

interface EditCategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

async function EditCategoryContent({ params }: EditCategoryPageProps) {
  const { categoryId } = await params;
  return <EditCategoryPageView categoryId={categoryId} />;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
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
      <EditCategoryContent params={params} />
    </Suspense>
  );
}
