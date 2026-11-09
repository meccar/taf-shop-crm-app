"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { slugify } from "@/lib/utils";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import type { Category } from "@/features/categories/types/category.types";
import type { Store } from "@/features/stores/types/store.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_ICON_OPTIONS } from "@/components/shared/category-icon";
import {
  FieldActionButton,
  FormActions,
  FormField,
  FormGrid,
  FormLayout,
  FormSelect,
  type SelectOption,
} from "@/components/shared/form-fields";

interface CategoryFormProps {
  stores: Store[];
  initialData?: Category;
  defaultPosOrder?: number;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "Active (POS Visible)" },
  { value: "INACTIVE", label: "Inactive / Hidden" },
];

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
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Category Title"
        required
        htmlFor="cat-name"
        error={errors.name}
      >
        <Input
          id="cat-name"
          placeholder="e.g. Wellness & Herbal Remedies"
          {...register("name")}
        />
      </FormField>

      <FormGrid>
        <FormField
          label="URL Slug"
          required
          htmlFor="cat-slug"
          error={errors.slug}
          labelAction={
            <FieldActionButton icon={Sparkles} onClick={handleAutoSlug}>
              From title
            </FieldActionButton>
          }
        >
          <Input
            id="cat-slug"
            placeholder="wellness-remedies"
            className="font-mono text-xs"
            {...register("slug")}
          />
        </FormField>

        <FormField
          label="POS Sequence Order"
          required
          htmlFor="cat-pos-order"
          error={errors.posOrder}
        >
          <Input
            id="cat-pos-order"
            type="number"
            min="1"
            max="99"
            className="font-mono tabular-nums"
            {...register("posOrder")}
          />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField
          label="POS Quick-Key Icon"
          htmlFor="cat-icon"
          error={errors.iconKey}
        >
          <FormSelect
            control={control}
            name="iconKey"
            id="cat-icon"
            options={CATEGORY_ICON_OPTIONS}
            placeholder="Choose icon"
          />
        </FormField>

        <FormField
          label="Category Status"
          htmlFor="cat-status"
          error={errors.status}
        >
          <FormSelect
            control={control}
            name="status"
            id="cat-status"
            options={STATUS_OPTIONS}
            placeholder="Choose status"
          />
        </FormField>
      </FormGrid>

      <FormField
        label="Description"
        htmlFor="cat-desc"
        error={errors.description}
      >
        <Textarea
          id="cat-desc"
          rows={2}
          placeholder="Brief summary for channel listings and POS navigation..."
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
