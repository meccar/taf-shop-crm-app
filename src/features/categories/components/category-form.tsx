"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
import { applyFieldErrors, getErrorMessage } from "@/lib/api/errors";
import { useActiveStoreId } from "@/lib/api/use-active-store";
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

const CATEGORY_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "parentId",
  "status",
];

export function CategoryForm({
  category,
  onSuccess,
}: {
  category?: Category | null;
  onSuccess?: (saved: Category) => void;
}) {
  const isEditing = Boolean(category);
  const router = useRouter();
  const activeStoreId = useActiveStoreId();

  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [slugTouched, setSlugTouched] = useState(Boolean(category));

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
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? "",
      status: category?.status ?? CategoryStatus.INACTIVE,
    },
  });

  const parentOptionsQuery = useCategoriesListQuery(
    { page: 1, limit: 100 },
    Boolean(activeStoreId),
  );
  const parentOptions = (parentOptionsQuery.data?.items ?? []).filter(
    (item) => item.id !== category?.id,
  );

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
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

  const backHref = category ? `/categories/${category.id}` : "/categories";

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const saved = category
        ? await updateMutation.mutateAsync({ id: category.id, values })
        : await createMutation.mutateAsync(values);

      toast.success(
        category
          ? tCategories("toasts.updated")
          : tCategories("toasts.created"),
      );

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push(`/categories/${saved.id}`);
      }
    } catch (err) {
      applyFieldErrors(err, form.setError, CATEGORY_FORM_FIELDS);
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
            {isEditing
              ? tCategories("editCategory")
              : tCategories("createCategory")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditing
              ? tCategories("dialogs.editSubtitle")
              : tCategories("dialogs.createSubtitle")}
          </p>
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
          <Button type="submit" disabled={isSubmitting}>
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

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{tCategories("viewCategory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-form-name">
              {tCategories("fields.name")} *
            </Label>
            <Input
              id="cat-form-name"
              placeholder={tCategories("fields.namePlaceholder")}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-form-slug">
                {tCategories("fields.slug")} *
              </Label>
              <Input
                id="cat-form-slug"
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
              <Label htmlFor="cat-form-status">
                {tCategories("fields.status")}
              </Label>
              <Select
                value={String(form.watch("status"))}
                onValueChange={(value) =>
                  form.setValue("status", Number(value) as CategoryStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="cat-form-status">
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
            <Label htmlFor="cat-form-parent">
              {tCategories("fields.parentId")}
            </Label>
            <Select
              value={form.watch("parentId") || "__none__"}
              onValueChange={(value) =>
                form.setValue("parentId", value === "__none__" ? "" : value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="cat-form-parent">
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
            <Label htmlFor="cat-form-description">
              {tCategories("fields.description")}
            </Label>
            <Textarea
              id="cat-form-description"
              rows={4}
              placeholder={tCategories("fields.descriptionPlaceholder")}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
