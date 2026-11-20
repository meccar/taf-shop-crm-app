import { StoreEditView } from "@/features/stores/components/store-edit-view";

export default async function StoreEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoreEditView storeId={id} />;
}
