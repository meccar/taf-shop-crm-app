"use client";

import { FolderTree } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import type { Category } from "@/features/categories/types/category.types";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import type { Store } from "@/features/stores/types/store.types";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/api/category.queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/features/categories/components/category-form";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  editingCategory?: Category | null;
  nextPosOrder?: number;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  stores,
  editingCategory,
  nextPosOrder = 9,
}: CategoryFormDialogProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditing = Boolean(editingCategory);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate(
        { categoryId: editingCategory.id, payload: values },
        {
          onSuccess: (updated) => {
            toast.success(`Updated category "${updated.name}"`);
            onOpenChange(false);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Created category "${created.name}" (/${created.slug})`);
        onOpenChange(false);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEditing
                  ? `Edit Category · ${editingCategory?.name}`
                  : "New Catalog Category"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update slug, POS quick-key order, and store availability."
                  : "Define a multi-store navigation category and POS sequence order."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <CategoryForm
          key={editingCategory?.id ?? "new-category"}
          stores={stores}
          initialData={editingCategory ?? undefined}
          defaultPosOrder={nextPosOrder}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save Category Changes" : "Save Category"}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
