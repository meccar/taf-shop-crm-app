"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import {
  useCreateStore,
  useStore,
  useStores,
  useUpdateStore,
} from "@/features/stores/api/store.queries";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { StoreForm } from "@/features/stores/components/store-form";

export function CreateStorePageView() {
  const router = useRouter();
  const { data: storesList } = useStores({ page: 1, pageSize: 100 });
  const createStoreMutation = useCreateStore();

  const nextCode = `#STR-0${(storesList?.summary.totalStores ?? 4) + 1}`;

  const handleCreate = (values: StoreFormValues) => {
    createStoreMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Created store "${created.name}" (${created.code})`);
        router.push(`/stores/${created.id}`);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Stores
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Create Retail Store
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provision a new physical or seasonal retail store instance in the
          tenant network.
        </p>
      </div>

      <Card className="p-6">
        <StoreForm
          suggestedCode={nextCode}
          isSubmitting={createStoreMutation.isPending}
          submitLabel="Save & Create Store"
          onSubmit={handleCreate}
          onCancel={() => router.push("/stores")}
        />
      </Card>
    </div>
  );
}

export function EditStorePageView({ storeId }: { storeId: string }) {
  const router = useRouter();
  const { data: store, isLoading, isError, error, refetch } = useStore(storeId);
  const updateStoreMutation = useUpdateStore();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <ErrorState
        title="Unable to load store for editing"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const handleUpdate = (values: StoreFormValues) => {
    updateStoreMutation.mutate(
      { storeId: store.id, payload: values },
      {
        onSuccess: (updated) => {
          toast.success(`Saved changes to "${updated.name}"`);
          router.push(`/stores/${updated.id}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/stores/${store.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {store.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Edit Store · {store.code}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update location address, tax configuration, manager assignment, and
          POS operational status.
        </p>
      </div>

      <Card className="p-6">
        <StoreForm
          initialData={store}
          isSubmitting={updateStoreMutation.isPending}
          submitLabel="Save Store Changes"
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/stores/${store.id}`)}
        />
      </Card>
    </div>
  );
}
