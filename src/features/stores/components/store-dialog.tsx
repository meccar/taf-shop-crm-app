"use client";

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
import { getErrorMessage } from "@/lib/api/errors";
import { clearActiveStoreId, getActiveStoreId } from "@/lib/api/store-context";
import {
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "../api/store.queries";
import { StoreStatus } from "../constants/store.constant";
import { Store } from "../types/store.types";

export function StoreStatusDialog({
  store,
  targetStatus,
  onClose,
}: {
  store: Store | null;
  targetStatus: StoreStatus.ACTIVE | StoreStatus.INACTIVE | null;
  onClose: () => void;
}) {
  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const updateMutation = useUpdateStoreMutation();

  const isActivating = targetStatus === StoreStatus.ACTIVE;

  const handleConfirm = async () => {
    if (!store || targetStatus === null) return;
    try {
      await updateMutation.mutateAsync({
        id: store.id,
        values: { status: targetStatus },
      });
      toast.success(
        isActivating
          ? tStores("toasts.activated")
          : tStores("toasts.deactivated"),
      );
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <AlertDialog
      open={Boolean(store) && targetStatus !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {store
              ? isActivating
                ? tStores("dialogs.activateTitle", { name: store.name })
                : tStores("dialogs.deactivateTitle", { name: store.name })
              : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivating
              ? tStores("dialogs.activateDescription")
              : tStores("dialogs.deactivateDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateMutation.isPending}>
            {tCommon("actions.cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={updateMutation.isPending}
            onClick={handleConfirm}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>
              {isActivating
                ? tCommon("actions.activate")
                : tCommon("actions.deactivate")}
            </span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StoreDeleteDialog({
  store,
  onClose,
  onDeleted,
}: {
  store: Store | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const deleteMutation = useDeleteStoreMutation();

  const handleDelete = async () => {
    if (!store) return;
    try {
      await deleteMutation.mutateAsync(store.id);
      if (getActiveStoreId() === store.id) {
        clearActiveStoreId();
      }
      toast.success(tStores("toasts.deleted"));
      onClose();
      onDeleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <AlertDialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive-bg text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <AlertDialogTitle>
                {store
                  ? tStores("dialogs.deleteTitle", { name: store.name })
                  : ""}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {tStores("dialogs.deleteDescription")}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            {tCommon("actions.cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>{tStores("dialogs.deleteConfirm")}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
