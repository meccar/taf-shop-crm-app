"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { slugify } from "@/lib/utils";
import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
} from "../api/store.queries";
import { StoreStatus, STORE_STATUS_VALUES } from "../constants/store.constant";
import {
  createStoreFormSchema,
  StoreFormValues,
} from "../schemas/store.schema";
import { Store } from "../types/store.types";

const STORE_FORM_FIELDS = [
  "name",
  "slug",
  "code",
  "address",
  "cityStateZip",
  "phone",
  "email",
  "taxRate",
  "description",
  "status",
];

export function StoreForm({
  store,
  onSuccess,
}: {
  store?: Store | null;
  onSuccess?: (saved: Store) => void;
}) {
  const isEditing = Boolean(store);
  const router = useRouter();
  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [slugTouched, setSlugTouched] = useState(Boolean(store));

  const schema = useMemo(
    () =>
      createStoreFormSchema({
        required: tCommon("validation.required"),
        maxName: tCommon("validation.maxLength", { max: 150 }),
        maxSlug: tCommon("validation.maxLength", { max: 160 }),
        invalidSlug: tCommon("validation.invalidSlug"),
        maxCode: tCommon("validation.maxLength", { max: 50 }),
        invalidCode: tCommon("validation.invalidCode"),
        maxAddress: tCommon("validation.maxLength", { max: 255 }),
        maxCityStateZip: tCommon("validation.maxLength", { max: 255 }),
        maxPhone: tCommon("validation.maxLength", { max: 50 }),
        maxEmail: tCommon("validation.maxLength", { max: 100 }),
        invalidEmail: tCommon("validation.invalidEmail"),
        nonNegativeTax: tCommon("validation.nonNegativeNumber"),
        maxDescription: tCommon("validation.maxLength", { max: 500 }),
      }),
    [tCommon],
  );

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store?.name ?? "",
      slug: store?.slug ?? "",
      code: store?.code ?? "",
      address: store?.address ?? "",
      cityStateZip: store?.cityStateZip ?? "",
      phone: store?.phone ?? "",
      email: store?.email ?? "",
      taxRate: store ? Number(store.taxRate ?? 0) : 0,
      description: store?.description ?? "",
      status: store?.status ?? StoreStatus.PENDING,
    },
  });

  const createMutation = useCreateStoreMutation();
  const updateMutation = useUpdateStoreMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && !slugTouched) {
      form.setValue("slug", slugify(watchedName || ""), {
        shouldValidate: false,
      });
    }
  }, [watchedName, isEditing, slugTouched, form]);

  const backHref = store ? `/stores/${store.id}` : "/stores";

  const onSubmit = async (values: StoreFormValues) => {
    try {
      const saved = store
        ? await updateMutation.mutateAsync({ id: store.id, values })
        : await createMutation.mutateAsync(values);

      toast.success(
        store ? tStores("toasts.updated") : tStores("toasts.created"),
      );

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push(`/stores/${saved.id}`);
      }
    } catch (err) {
      applyFieldErrors(err, form.setError, STORE_FORM_FIELDS);
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
            nativeButton={false}
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
            {isEditing ? tStores("editStore") : tStores("createStore")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditing
              ? tStores("dialogs.editSubtitle")
              : tStores("dialogs.createSubtitle")}
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
          <CardTitle>{tStores("viewStore")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="store-form-name">
                {tStores("fields.name")} *
              </Label>
              <Input
                id="store-form-name"
                placeholder={tStores("fields.namePlaceholder")}
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="store-form-code">
                {tStores("fields.code")} *
              </Label>
              <Input
                id="store-form-code"
                className="font-mono uppercase"
                placeholder={tStores("fields.codePlaceholder")}
                {...form.register("code", {
                  onChange: (event) => {
                    event.target.value = event.target.value.toUpperCase();
                  },
                })}
              />
              {form.formState.errors.code ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.code.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="store-form-slug">
                {tStores("fields.slug")} *
              </Label>
              <Input
                id="store-form-slug"
                className="font-mono"
                placeholder={tStores("fields.slugPlaceholder")}
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
              <Label htmlFor="store-form-status">
                {tStores("fields.status")}
              </Label>
              <Select
                value={String(form.watch("status"))}
                onValueChange={(value) =>
                  form.setValue("status", Number(value) as StoreStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="store-form-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_STATUS_VALUES.map((statusVal) => (
                    <SelectItem key={statusVal} value={String(statusVal)}>
                      {tStores(`status.${statusVal}`)}
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
            <Label htmlFor="store-form-address">
              {tStores("fields.address")} *
            </Label>
            <Input
              id="store-form-address"
              placeholder={tStores("fields.addressPlaceholder")}
              {...form.register("address")}
            />
            {form.formState.errors.address ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.address.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-form-city-state">
              {tStores("fields.cityStateZip")} *
            </Label>
            <Input
              id="store-form-city-state"
              placeholder={tStores("fields.cityStateZipPlaceholder")}
              {...form.register("cityStateZip")}
            />
            {form.formState.errors.cityStateZip ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.cityStateZip.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="store-form-phone">
                {tStores("fields.phone")}
              </Label>
              <Input
                id="store-form-phone"
                type="tel"
                placeholder={tStores("fields.phonePlaceholder")}
                {...form.register("phone")}
              />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="store-form-email">
                {tStores("fields.email")}
              </Label>
              <Input
                id="store-form-email"
                type="email"
                placeholder={tStores("fields.emailPlaceholder")}
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="store-form-tax">
                {tStores("fields.taxRate")}
              </Label>
              <Input
                id="store-form-tax"
                type="number"
                step="0.01"
                min="0"
                className="font-mono tabular-nums"
                {...form.register("taxRate", {
                  setValueAs: (v) =>
                    v === "" || v === null || v === undefined
                      ? Number.NaN
                      : Number(v),
                })}
              />
              {form.formState.errors.taxRate ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.taxRate.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-form-description">
              {tStores("fields.description")}
            </Label>
            <Textarea
              id="store-form-description"
              rows={3}
              placeholder={tStores("fields.descriptionPlaceholder")}
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
