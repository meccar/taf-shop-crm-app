"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyFieldErrors, getErrorMessage } from "@/lib/api/errors";
import {
  useAdjustProductStockMutation,
  useDeleteProductMutation,
} from "../api/product.queries";
import {
  createAdjustStockSchema,
  AdjustStockValues,
} from "../schemas/product.schema";
import { Product } from "../types/product.type";

export function AdjustStockDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const schema = useMemo(
    () =>
      createAdjustStockSchema({
        integer: tCommon("validation.integer"),
        deltaNonZero: tProducts("validation.deltaNonZero"),
      }),
    [tCommon, tProducts],
  );

  const form = useForm<AdjustStockValues>({
    resolver: zodResolver(schema),
    defaultValues: { delta: 0 },
  });

  useEffect(() => {
    if (product) {
      form.reset({ delta: 0 });
    }
  }, [product, form]);

  const adjustMutation = useAdjustProductStockMutation();
  const deltaValue = Number(form.watch("delta") || 0);
  const projectedStock =
    (product?.stockQuantity ?? 0) + (Number.isNaN(deltaValue) ? 0 : deltaValue);

  const onSubmit = async (values: AdjustStockValues) => {
    if (!product) return;
    try {
      await adjustMutation.mutateAsync({ id: product.id, values });
      toast.success(tProducts("toasts.stockAdjusted"));
      onClose();
    } catch (err) {
      applyFieldErrors(err, form.setError, ["delta"]);
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product
              ? tProducts("dialogs.adjustStockTitle", { name: product.name })
              : ""}
          </DialogTitle>
          <DialogDescription>
            {product
              ? tProducts("dialogs.adjustStockDescription", {
                  current: product.stockQuantity,
                })
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="stock-delta">
              {tProducts("dialogs.deltaLabel")}
            </Label>
            <Input
              id="stock-delta"
              type="number"
              step="1"
              className="font-mono tabular-nums"
              {...form.register("delta")}
            />
            {form.formState.errors.delta ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.delta.message}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-muted tabular-nums">
            {tProducts("dialogs.projectedStock", { projected: projectedStock })}
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={adjustMutation.isPending}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {adjustMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>{tProducts("dialogs.adjustStockConfirm")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDeleteDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: Product | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const deleteMutation = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!product) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success(tProducts("toasts.deleted"));
      onClose();
      onDeleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <AlertDialog
      open={Boolean(product)}
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
                {product
                  ? tProducts("dialogs.deleteTitle", { name: product.name })
                  : ""}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {tProducts("dialogs.deleteDescription")}
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
            <span>{tProducts("dialogs.deleteConfirm")}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
