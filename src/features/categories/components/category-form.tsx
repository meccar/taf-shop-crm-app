"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { slugify } from "@/lib/utils";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import type { Category } from "@/features/categories/types/category.types";
import type { Store } from "@/features/stores/types/store.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_ICON_OPTIONS } from "@/components/shared/category-icon";

interface CategoryFormProps {
  stores: Store[];
  initialData?: Category;
  defaultPosOrder?: number;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel?: () => void;
}

export function CategoryForm({
  stores,
  initialData,
  defaultPosOrder = 9,
  isSubmitting,
  submitLabel = "Save Category",
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      iconKey: initialData?.iconKey ?? "layers",
      posOrder: initialData?.posOrder ?? defaultPosOrder,
      status: initialData?.status ?? "ACTIVE",
      appliesToAllStores: initialData?.appliesToAllStores ?? true,
      storeIds: initialData?.storeIds ?? stores.map((s) => s.id),
    },
  });

  const appliesToAllStores = watch("appliesToAllStores");
  const selectedStoreIds = watch("storeIds");
  const watchedName = watch("name");

  const handleAutoSlug = () => {
    const generated = slugify(watchedName);
    if (generated) {
      setValue("slug", generated, { shouldValidate: true });
    }
  };

  const toggleStoreId = (storeId: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedStoreIds, storeId]))
      : selectedStoreIds.filter((id) => id !== storeId);
    setValue("storeIds", next, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Category Title *</Label>
        <Input
          id="cat-name"
          placeholder="e.g. Wellness & Herbal Remedies"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="cat-slug">URL Slug *</Label>
            <button
              type="button"
              onClick={handleAutoSlug}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              From title
            </button>
          </div>
          <Input
            id="cat-slug"
            placeholder="wellness-remedies"
            className="font-mono text-xs"
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-pos-order">POS Sequence Order *</Label>
          <Input
            id="cat-pos-order"
            type="number"
            min="1"
            max="99"
            className="font-mono tabular-nums"
            {...register("posOrder")}
          />
          {errors.posOrder && (
            <p className="text-xs text-destructive">
              {errors.posOrder.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>POS Quick-Key Icon</Label>
          <Controller
            control={control}
            name="iconKey"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose icon" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Category Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (POS Visible)</SelectItem>
                  <SelectItem value="INACTIVE">Inactive / Hidden</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-desc">Description</Label>
        <Textarea
          id="cat-desc"
          rows={2}
          placeholder="Brief summary for channel listings and POS navigation..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Store Availability Scope */}
      <div className="space-y-3 rounded-xl border border-border bg-background p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="all-stores-switch">
              Available Across All Provisioned Stores
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically expose this category in every current and future
              store location.
            </p>
          </div>
          <Controller
            control={control}
            name="appliesToAllStores"
            render={({ field }) => (
              <Switch
                id="all-stores-switch"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked) {
                    setValue(
                      "storeIds",
                      stores.map((s) => s.id),
                      { shouldValidate: true },
                    );
                  }
                }}
              />
            )}
          />
        </div>

        {!appliesToAllStores && (
          <div className="grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-2">
            {stores.map((store) => {
              const checked = selectedStoreIds.includes(store.id);
              return (
                <label
                  key={store.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-accent/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(val) =>
                      toggleStoreId(store.id, Boolean(val))
                    }
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {store.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      {store.code}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
        {errors.storeIds && (
          <p className="text-xs text-destructive">{errors.storeIds.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
