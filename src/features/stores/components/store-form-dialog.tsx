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
import { Store } from "../types/store.types";
import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
} from "../api/store.queries";
import { StoreStatus, STORE_STATUS_VALUES } from "../constants/store.constant";
import {
  createStoreFormSchema,
  StoreFormValues,
} from "../schemas/store.schema";

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store | null;
}

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

export function StoreFormDialog({
  open,
  onOpenChange,
  store,
}: StoreFormDialogProps) {
  const isEditing = Boolean(store);
  const tStores = useTranslations("stores");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [slugTouched, setSlugTouched] = useState(false);

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
      name: "",
      slug: "",
      code: "",
      address: "",
      cityStateZip: "",
      phone: "",
      email: "",
      taxRate: 0,
      description: "",
      status: StoreStatus.PENDING,
    },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(Boolean(store));
    if (store) {
      form.reset({
        name: store.name,
        slug: store.slug,
        code: store.code,
        address: store.address,
        cityStateZip: store.cityStateZip,
        phone: store.phone ?? "",
        email: store.email ?? "",
        taxRate: Number(store.taxRate ?? 0),
        description: store.description ?? "",
        status: store.status,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        code: "",
        address: "",
        cityStateZip: "",
        phone: "",
        email: "",
        taxRate: 0,
        description: "",
        status: StoreStatus.PENDING,
      });
    }
  }, [open, store, form]);

  const createMutation = useCreateStoreMutation();
  const updateMutation = useUpdateStoreMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && !slugTouched) {
      form.setValue("slug", slugify(watchedName || ""), {
        shouldValidate: false,
      });
    }
  }, [watchedName, isEditing, slugTouched, form]);

  const onSubmit = async (values: StoreFormValues) => {
    try {
      if (store) {
        await updateMutation.mutateAsync({ id: store.id, values });
        toast.success(tStores("toasts.updated"));
      } else {
        await createMutation.mutateAsync(values);
        toast.success(tStores("toasts.created"));
      }
      onOpenChange(false);
    } catch (err) {
      applyFieldErrors(err, form.setError, STORE_FORM_FIELDS);
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? tStores("editStore") : tStores("createStore")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? tStores("dialogs.editSubtitle")
              : tStores("dialogs.createSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="store-name">{tStores("fields.name")} *</Label>
              <Input
                id="store-name"
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
              <Label htmlFor="store-code">{tStores("fields.code")} *</Label>
              <Input
                id="store-code"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="store-slug">{tStores("fields.slug")} *</Label>
              <Input
                id="store-slug"
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
              <Label htmlFor="store-status">{tStores("fields.status")}</Label>
              <Select
                value={String(form.watch("status"))}
                onValueChange={(value) =>
                  form.setValue("status", Number(value) as StoreStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="store-status">
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
            <Label htmlFor="store-address">{tStores("fields.address")} *</Label>
            <Input
              id="store-address"
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
            <Label htmlFor="store-city-state">
              {tStores("fields.cityStateZip")} *
            </Label>
            <Input
              id="store-city-state"
              placeholder={tStores("fields.cityStateZipPlaceholder")}
              {...form.register("cityStateZip")}
            />
            {form.formState.errors.cityStateZip ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.cityStateZip.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="store-phone">{tStores("fields.phone")}</Label>
              <Input
                id="store-phone"
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
              <Label htmlFor="store-email">{tStores("fields.email")}</Label>
              <Input
                id="store-email"
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
              <Label htmlFor="store-tax">{tStores("fields.taxRate")}</Label>
              <Input
                id="store-tax"
                type="number"
                step="0.01"
                min="0"
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
            <Label htmlFor="store-description">
              {tStores("fields.description")}
            </Label>
            <Textarea
              id="store-description"
              rows={2}
              placeholder={tStores("fields.descriptionPlaceholder")}
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
