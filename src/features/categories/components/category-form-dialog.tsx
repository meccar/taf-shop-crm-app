"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors, getErrorMessage } from "@/lib/api/errors";
import { slugify } from "@/lib/utils";
import {
  useCategoriesListQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/category.queries";
import {
  CategoryStatus,
  CATEGORY_STATUS_VALUES,
} from "../constants/categories.constant";
import {
  createCategoryFormSchema,
  CategoryFormValues,
} from "../schemas/category.schema";
import { Category } from "../types/category.type";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const CATEGORY_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "parentId",
  "status",
];

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [slugTouched, setSlugTouched] = useState(false);

  const schema = useMemo(
    () =>
      createCategoryFormSchema({
        required: tCommon("validation.required"),
        maxName: tCommon("validation.maxLength", { max: 120 }),
        maxSlug: tCommon("validation.maxLength", { max: 140 }),
        invalidSlug: tCommon("validation.invalidSlug"),
      }),
    [tCommon],
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "",
      status: CategoryStatus.INACTIVE,
    },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(Boolean(category));
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        parentId: category.parentId ?? "",
        status: category.status,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        status: CategoryStatus.INACTIVE,
      });
    }
  }, [open, category, form]);

  const parentOptionsQuery = useCategoriesListQuery(
    { page: 1, limit: 100 },
    open,
  );
  const parentOptions = (parentOptionsQuery.data?.items ?? []).filter(
    (item) => item.id !== category?.id,
  );

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && !slugTouched) {
      form.setValue("slug", slugify(watchedName || ""), {
        shouldValidate: false,
      });
    }
  }, [watchedName, isEditing, slugTouched, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, values });
        toast.success(tCategories("toasts.updated"));
      } else {
        await createMutation.mutateAsync(values);
        toast.success(tCategories("toasts.created"));
      }
      onOpenChange(false);
    } catch (err) {
      applyFieldErrors(err, form.setError, CATEGORY_FORM_FIELDS);
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? tCategories("editCategory")
              : tCategories("createCategory")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? tCategories("dialogs.editSubtitle")
              : tCategories("dialogs.createSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">{tCategories("fields.name")} *</Label>
            <Input
              id="cat-name"
              placeholder={tCategories("fields.namePlaceholder")}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">{tCategories("fields.slug")} *</Label>
              <Input
                id="cat-slug"
                className="font-mono"
                placeholder={tCategories("fields.slugPlaceholder")}
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
              <Label htmlFor="cat-status">{tCategories("fields.status")}</Label>
              <Select
                value={String(form.watch("status"))}
                onValueChange={(value) =>
                  form.setValue("status", Number(value) as CategoryStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="cat-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_STATUS_VALUES.map((statusVal) => (
                    <SelectItem key={statusVal} value={String(statusVal)}>
                      {tCategories(`status.${statusVal}`)}
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-parent">{tCategories("fields.parentId")}</Label>
            <Select
              value={form.watch("parentId") || "__none__"}
              onValueChange={(value) =>
                form.setValue("parentId", value === "__none__" ? "" : value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="cat-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  {tCategories("fields.noParent")}
                </SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.parentId ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.parentId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-description">
              {tCategories("fields.description")}
            </Label>
            <Textarea
              id="cat-description"
              rows={3}
              placeholder={tCategories("fields.descriptionPlaceholder")}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{tCommon("actions.saving")}</span>
                </>
              ) : (
                tCommon("actions.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
