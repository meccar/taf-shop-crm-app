import { CategoryDetailView } from "@/features/categories/components/category-detail-view";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryDetailView categoryId={id} />;
}
