import { CategoryEditView } from "@/features/categories/components/category-edit-view";

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryEditView categoryId={id} />;
}
