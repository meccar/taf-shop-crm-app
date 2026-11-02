"use client";

import { Package } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import type { Product } from "@/features/products/types/product.types";
import type { ProductFormValues } from "@/features/products/schemas/product.schema";
import type { Category } from "@/features/categories/types/category.types";
import type { Store } from "@/features/stores/types/store.types";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/api/product.queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/features/products/components/product-form";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeStore: Store;
  categories: Category[];
  editingProduct?: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  activeStore,
  categories,
  editingProduct,
}: ProductFormDialogProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEditing = Boolean(editingProduct);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate(
        { productId: editingProduct.id, payload: values },
        {
          onSuccess: (updated) => {
            toast.success(`Updated SKU "${updated.sku}" (${updated.name})`);
            onOpenChange(false);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Created product "${created.name}" (${created.sku})`);
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
              <Package className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEditing
                  ? `Edit Product · ${editingProduct?.sku}`
                  : "Add Store Product"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Modify pricing, SKU identifier, category assignment, or stock levels."
                  : `Register a new catalog SKU for ${activeStore.name}.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ProductForm
          key={editingProduct?.id ?? `new-prod-${activeStore.id}`}
          activeStore={activeStore}
          categories={categories}
          initialData={editingProduct ?? undefined}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save Product Changes" : "Create Product"}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
