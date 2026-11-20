"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/category.queries";
import { CategoryStatus } from "../constants/categories.constant";
import { Category } from "../types/category.type";

export function CategoryDeleteDialog({
  category,
  onClose,
  onDeleted,
}: {
  category: Category | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [inUseConflict, setInUseConflict] = useState(false);

  const deleteMutation = useDeleteCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const isBusy = deleteMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    setInUseConflict(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!category) return;
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success(tCategories("toasts.deleted"));
      handleClose();
      onDeleted?.();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setInUseConflict(true);
      }
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  const handleDeactivateInstead = async () => {
    if (!category) return;
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        values: { status: CategoryStatus.INACTIVE },
      });
      toast.success(tCategories("toasts.deactivated"));
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <AlertDialog
      open={Boolean(category)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive-bg text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <AlertDialogTitle>
                {category
                  ? tCategories("dialogs.deleteTitle", { name: category.name })
                  : ""}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {inUseConflict
                  ? tCategories("dialogs.deleteConflict")
                  : tCategories("dialogs.deleteDescription")}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>
            {tCommon("actions.cancel")}
          </AlertDialogCancel>
          {inUseConflict ? (
            <Button
              type="button"
              disabled={isBusy}
              onClick={handleDeactivateInstead}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{tCommon("actions.deactivateInstead")}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy}
              onClick={handleDelete}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{tCategories("dialogs.deleteConfirm")}</span>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
