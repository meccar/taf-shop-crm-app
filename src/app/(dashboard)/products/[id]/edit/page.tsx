import { ProductEditView } from "@/features/products/components/product-edit-view";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductEditView productId={id} />;
}
