"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product.schema";
import type { Product } from "@/features/products/types/product.types";
import type { Category } from "@/features/categories/types/category.types";
import type { Store } from "@/features/stores/types/store.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FieldActionButton,
  FormActions,
  FormField,
  FormGrid,
  FormLayout,
  FormSelect,
  type SelectOption,
} from "@/components/shared/form-fields";

interface ProductFormProps {
  activeStore: Store;
  categories: Category[];
  initialData?: Product;
  defaultLowStockThreshold?: number;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductFormValues) => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "Active (POS Visible)" },
  { value: "DRAFT", label: "Draft (Staging)" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ProductForm({
  activeStore,
  categories,
  initialData,
  defaultLowStockThreshold = 10,
  isSubmitting,
  submitLabel = "Save Product",
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const defaultCategoryId = initialData?.categoryId ?? categories[0]?.id ?? "";

  const {
    register,
    control,
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      storeId: initialData?.storeId ?? activeStore.id,
      categoryId: defaultCategoryId,
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 28.0,
      stockQuantity: initialData?.stockQuantity ?? 24,
      lowStockThreshold:
        initialData?.lowStockThreshold ?? defaultLowStockThreshold,
      status: initialData?.status ?? "ACTIVE",
      imageUrl: initialData?.imageUrl ?? "",
    },
  });

  const categoryOptions = React.useMemo<SelectOption[]>(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: `${cat.name} (/${cat.slug})`,
      })),
    [categories],
  );

  React.useEffect(() => {
    if (!getValues("categoryId") && categories.length > 0) {
      setValue("categoryId", categories[0].id);
    }
  }, [categories, getValues, setValue]);

  // Ensure categoryId gets populated once categories finish loading
  React.useEffect(() => {
    if (!watch("categoryId") && categories.length > 0) {
      setValue("categoryId", categories[0].id);
    }
  }, [categories, setValue, watch]);

  const currentName = watch("name");

  const handleGenerateSku = () => {
    const storePrefix = activeStore.code.replace(/[^A-Z0-9]/gi, "").slice(0, 5);
    const nameTokens = currentName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const itemToken =
      nameTokens.length > 0
        ? nameTokens
            .slice(0, 2)
            .map((w) => w.slice(0, 3))
            .join("-")
        : "SKU";
    const suffix = String(Math.floor(100 + Math.random() * 900));
    setValue("sku", `${storePrefix}-${itemToken}-${suffix}`, {
      shouldValidate: true,
    });
  };

  return (
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("storeId")} />

      <FormGrid cols={5}>
        <FormField
          label="Product Name"
          required
          htmlFor="prod-name"
          error={errors.name}
          className="@md:col-span-3"
        >
          <Input
            id="prod-name"
            placeholder="e.g. Hand-Glazed Stoneware Mug"
            {...register("name")}
          />
        </FormField>

        <FormField
          label="SKU"
          required
          htmlFor="prod-sku"
          error={errors.sku}
          className="@md:col-span-2"
          labelAction={
            <FieldActionButton icon={Sparkles} onClick={handleGenerateSku}>
              Auto-SKU
            </FieldActionButton>
          }
        >
          <Input
            id="prod-sku"
            placeholder="STR01-MUG-204"
            className="font-mono uppercase tabular-nums"
            {...register("sku")}
          />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField
          label="Assigned Category"
          required
          htmlFor="prod-category"
          error={errors.categoryId}
        >
          <FormSelect
            control={control}
            name="categoryId"
            id="prod-category"
            options={categoryOptions}
            placeholder="Choose category"
          />
        </FormField>

        <FormField
          label="Catalog Status"
          required
          htmlFor="prod-status"
          error={errors.status}
        >
          <FormSelect
            control={control}
            name="status"
            id="prod-status"
            options={STATUS_OPTIONS}
            placeholder="Select status"
          />
        </FormField>
      </FormGrid>

      <FormGrid cols={3}>
        <FormField
          label="Unit Price (USD)"
          required
          htmlFor="prod-price"
          error={errors.price}
        >
          <Input
            id="prod-price"
            type="number"
            step="0.01"
            min="0.01"
            className="tabular-nums"
            {...register("price")}
          />
        </FormField>

        <FormField
          label="Stock Quantity"
          required
          htmlFor="prod-stock"
          error={errors.stockQuantity}
        >
          <Input
            id="prod-stock"
            type="number"
            step="1"
            min="0"
            className="tabular-nums"
            {...register("stockQuantity")}
          />
        </FormField>

        <FormField
          label="Low-Stock Threshold"
          required
          htmlFor="prod-threshold"
          error={errors.lowStockThreshold}
        >
          <Input
            id="prod-threshold"
            type="number"
            step="1"
            min="0"
            className="tabular-nums"
            {...register("lowStockThreshold")}
          />
        </FormField>
      </FormGrid>

      <FormField
        label="Catalog Description"
        htmlFor="prod-desc"
        error={errors.description}
      >
        <Textarea
          id="prod-desc"
          rows={2}
          placeholder="Material specifications, care instructions, and POS display notes..."
          {...register("description")}
        />
      </FormField>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </FormLayout>
  );
}
