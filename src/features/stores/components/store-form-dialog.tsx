"use client";

import { Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import type { Store } from "@/features/stores/types/store.types";
import type { StoreFormValues } from "@/features/stores/schemas/store.schema";
import {
  useCreateStore,
  useUpdateStore,
} from "@/features/stores/api/store.queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoreForm } from "@/features/stores/components/store-form";

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStore?: Store | null;
  totalStoresCount?: number;
}

export function StoreFormDialog({
  open,
  onOpenChange,
  editingStore,
  totalStoresCount = 4,
}: StoreFormDialogProps) {
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const isEditing = Boolean(editingStore);
  const isSubmitting =
    createStoreMutation.isPending || updateStoreMutation.isPending;

  const suggestedCode = `#STR-0${totalStoresCount + 1}`;

  const handleSubmit = (values: StoreFormValues) => {
    if (editingStore) {
      updateStoreMutation.mutate(
        { storeId: editingStore.id, payload: values },
        {
          onSuccess: (updated) => {
            toast.success(`Updated store "${updated.name}" (${updated.code})`);
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        },
      );
      return;
    }

    createStoreMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Provisioned store "${created.name}" (${created.code})`);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <StoreIcon className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEditing
                  ? `Edit Store · ${editingStore?.code}`
                  : "Create Retail Store"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update location address, POS operational status, and primary lead."
                  : "Add a new store location to the tenant retail network."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <StoreForm
          key={editingStore?.id ?? "new-store"}
          initialData={editingStore ?? undefined}
          suggestedCode={suggestedCode}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save Store Changes" : "Save & Create Store"}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
