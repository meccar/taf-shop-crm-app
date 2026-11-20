"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequireActiveStore } from "@/components/shared/require-active-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/features/uploads/components/image-uploader";
import { applyFieldErrors, getErrorMessage } from "@/lib/api/errors";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { slugify } from "@/lib/utils";
import { useCategoriesListQuery } from "@/features/categories/api/category.queries";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../api/product.queries";
import {
  ProductStatus,
  PRODUCT_STATUS_VALUES,
} from "../constants/product.constant";
import {
  createProductFormSchema,
  ProductFormValues,
} from "../schemas/product.schema";
import { Product } from "../types/product.type";

const PRODUCT_FORM_FIELDS = [
  "sku",
  "name",
  "slug",
  "description",
  "price",
  "costPrice",
  "stockQuantity",
  "lowStockThreshold",
  "status",
  "categoryId",
  "images",
];

function metadataRecordToEntries(
  metadata: Record<string, unknown> | null | undefined,
): Array<{ key: string; value: string }> {
  if (!metadata) return [];
  return Object.entries(metadata).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? "" : String(value),
  }));
}

export function ProductForm({
  product,
  onSuccess,
}: {
  product?: Product | null;
  onSuccess?: (saved: Product) => void;
}) {
  const isEditing = Boolean(product);
  const router = useRouter();
  const activeStoreId = useActiveStoreId();

  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [uploadBlocked, setUploadBlocked] = useState(false);

  const schema = useMemo(
    () =>
      createProductFormSchema({
        required: tCommon("validation.required"),
        maxSku: tCommon("validation.maxLength", { max: 64 }),
        maxName: tCommon("validation.maxLength", { max: 200 }),
        maxSlug: tCommon("validation.maxLength", { max: 220 }),
        invalidSlug: tCommon("validation.invalidSlug"),
        positivePrice: tCommon("validation.positiveNumber"),
        nonNegativeCost: tCommon("validation.nonNegativeNumber"),
        nonNegativeInt: tCommon("validation.nonNegativeNumber"),
        integer: tCommon("validation.integer"),
        maxDecimals: tCommon("validation.maxDecimalPlaces", { places: 2 }),
        activeRequiresStock: tProducts("validation.activeRequiresStock"),
        deltaNonZero: tProducts("validation.deltaNonZero"),
      }),
    [tCommon, tProducts],
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: product?.sku ?? "",
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product ? Number(product.price) : 0,
      costPrice:
        product?.costPrice !== null && product?.costPrice !== undefined
          ? Number(product.costPrice)
          : "",
      stockQuantity: product?.stockQuantity ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 5,
      status: product?.status ?? ProductStatus.DRAFT,
      categoryId: product?.categoryId ?? "",
      images: product?.images ?? [],
      metadataEntries: metadataRecordToEntries(product?.metadata),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metadataEntries",
  });

  const categoriesQuery = useCategoriesListQuery({ page: 1, limit: 100 });
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && !slugTouched) {
      form.setValue("slug", slugify(watchedName || ""), {
        shouldValidate: false,
      });
    }
  }, [watchedName, isEditing, slugTouched, form]);

  if (!activeStoreId) {
    return <RequireActiveStore />;
  }

  const backHref = product ? `/products/${product.id}` : "/products";

  const onSubmit = async (values: ProductFormValues) => {
    if (uploadBlocked) {
      toast.error(tProducts("upload.waitPending"));
      return;
    }

    try {
      const saved = product
        ? await updateMutation.mutateAsync({ id: product.id, values })
        : await createMutation.mutateAsync({ values, storeId: activeStoreId });

      toast.success(
        product ? tProducts("toasts.updated") : tProducts("toasts.created"),
      );

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push(`/products/${saved.id}`);
      }
    } catch (err) {
      applyFieldErrors(err, form.setError, PRODUCT_FORM_FIELDS);
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            render={
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                <span>{tCommon("actions.back")}</span>
              </Link>
            }
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {isEditing ? tProducts("editProduct") : tProducts("createProduct")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backHref)}
            disabled={isSubmitting}
          >
            {tCommon("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting || uploadBlocked}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{tCommon("actions.saving")}</span>
              </>
            ) : (
              tCommon("actions.save")
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{tProducts("viewProduct")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-name">
                    {tProducts("fields.name")} *
                  </Label>
                  <Input
                    id="prod-name"
                    placeholder={tProducts("fields.namePlaceholder")}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-sku">{tProducts("fields.sku")} *</Label>
                  <Input
                    id="prod-sku"
                    className="font-mono"
                    placeholder={tProducts("fields.skuPlaceholder")}
                    {...form.register("sku")}
                  />
                  {form.formState.errors.sku ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.sku.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-slug">{tProducts("fields.slug")} *</Label>
                <Input
                  id="prod-slug"
                  className="font-mono"
                  placeholder={tProducts("fields.slugPlaceholder")}
                  {...form.register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
                {form.formState.errors.slug ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-description">
                  {tProducts("fields.description")}
                </Label>
                <Textarea
                  id="prod-description"
                  rows={4}
                  placeholder={tProducts("fields.descriptionPlaceholder")}
                  {...form.register("description")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tProducts("fields.images")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                storeId={activeStoreId}
                value={form.watch("images")}
                onChange={(keys) =>
                  form.setValue("images", keys, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onPendingStateChange={setUploadBlocked}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{tProducts("fields.metadata")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ key: "", value: "" })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{tProducts("fields.addMetadata")}</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-sm text-muted">
                  {tProducts("fields.noMetadata")}
                </p>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder={tProducts("fields.metadataKey")}
                      className="font-mono text-xs"
                      {...form.register(`metadataEntries.${index}.key`)}
                    />
                    <Input
                      placeholder={tProducts("fields.metadataValue")}
                      className="text-xs"
                      {...form.register(`metadataEntries.${index}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label={tCommon("actions.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-muted hover:text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tProducts("columns.status")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-status">
                  {tProducts("fields.status")}
                </Label>
                <Select
                  value={String(form.watch("status"))}
                  onValueChange={(value) =>
                    form.setValue("status", Number(value) as ProductStatus, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="prod-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUS_VALUES.map((statusVal) => (
                      <SelectItem key={statusVal} value={String(statusVal)}>
                        {tProducts(`status.${statusVal}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.status ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-category">
                  {tProducts("fields.categoryId")} *
                </Label>
                <Select
                  value={form.watch("categoryId") || undefined}
                  onValueChange={(value) => {
                    if (!value) return;
                    form.setValue("categoryId", value, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger id="prod-category">
                    <SelectValue
                      placeholder={tProducts("fields.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesQuery.data?.items ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tProducts("columns.price")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-price">
                  {tProducts("fields.price")} *
                </Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="font-mono tabular-nums"
                  {...form.register("price")}
                />
                {form.formState.errors.price ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-cost">
                  {tProducts("fields.costPrice")}
                </Label>
                <Input
                  id="prod-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="font-mono tabular-nums"
                  {...form.register("costPrice")}
                />
                {form.formState.errors.costPrice ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.costPrice.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tProducts("columns.stock")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-stock">
                  {tProducts("fields.stockQuantity")}
                </Label>
                <Input
                  id="prod-stock"
                  type="number"
                  step="1"
                  min="0"
                  className="font-mono tabular-nums"
                  {...form.register("stockQuantity")}
                />
                {form.formState.errors.stockQuantity ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-threshold">
                  {tProducts("fields.lowStockThreshold")}
                </Label>
                <Input
                  id="prod-threshold"
                  type="number"
                  step="1"
                  min="0"
                  className="font-mono tabular-nums"
                  {...form.register("lowStockThreshold")}
                />
                {form.formState.errors.lowStockThreshold ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.lowStockThreshold.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
