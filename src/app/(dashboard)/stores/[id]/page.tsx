import { StoreDetailView } from "@/features/stores/components/store-detail-view";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoreDetailView storeId={id} />;
}
