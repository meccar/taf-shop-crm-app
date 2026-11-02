import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDetailView } from "@/features/categories/components/category-page-views";
import { Suspense } from "react";

interface CategoryDetailPageProps {
  params: Promise<{ categoryId: string }>;
}

async function CategoryDetailContent({ params }: CategoryDetailPageProps) {
  const { categoryId } = await params;
  return <CategoryDetailView categoryId={categoryId} />;
}

export default function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
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
      <CategoryDetailContent params={params} />
    </Suspense>
  );
}
