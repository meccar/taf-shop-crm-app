"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import {
  storeFormSchema,
  type StoreFormValues,
} from "@/features/stores/schemas/store.schema";
import type { Store } from "@/features/stores/types/store.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreFormProps {
  initialData?: Store;
  suggestedCode?: string;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: StoreFormValues) => void;
  onCancel?: () => void;
}

const FORMAT_OPTIONS = [
  { value: "FLAGSHIP", label: "Flagship Center" },
  { value: "MALL", label: "Mall Boutique" },
  { value: "OUTLET", label: "Outlet Clearance" },
  { value: "POPUP", label: "Pop-up Kiosk" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active POS" },
  { value: "INACTIVE", label: "Inactive (Setup Phase)" },
];

export function StoreForm({
  initialData,
  suggestedCode = "#STR-05",
  isSubmitting,
  submitLabel = "Save & Create Store",
  onSubmit,
  onCancel,
}: StoreFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? suggestedCode,
      format: initialData?.format ?? "FLAGSHIP",
      description: initialData?.description ?? "",
      address: initialData?.address ?? "",
      cityStateZip: initialData?.cityStateZip ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      managerName: initialData?.managerName ?? "Sarah Jenkins",
      managerEmail: initialData?.managerEmail ?? "sarah.j@shopcrm.internal",
      taxRate: initialData?.taxRate ?? 9.5,
      status: initialData?.status ?? "INACTIVE",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="store-name">Store Name *</Label>
          <Input
            id="store-name"
            placeholder="e.g. South Bay Showroom"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-code">Code *</Label>
          <Input
            id="store-code"
            placeholder="#STR-05"
            className="font-mono uppercase"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Store Format *</Label>
          {/* Store Format */}
          <Controller
            control={control}
            name="format"
            render={({ field }) => (
              <Select
                value={field.value}
                items={FORMAT_OPTIONS}
                onValueChange={(value) => {
                  if (value !== null) field.onChange(value);
                }}
              >
                <SelectTrigger id="store-format" className="w-full">
                  <SelectValue placeholder="Select store format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.format && (
            <p className="text-xs text-destructive">{errors.format.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Operational Status *</Label>
          {/* Operational Status */}
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                items={STATUS_OPTIONS}
                onValueChange={(value) => {
                  if (value !== null) field.onChange(value);
                }}
              >
                <SelectTrigger id="store-status" className="w-full">
                  <SelectValue placeholder="Select operational status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="store-address">Street Address *</Label>
          <Input
            id="store-address"
            placeholder="742 Evergreen Blvd, Suite 100"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-city">City, State & ZIP *</Label>
          <Input
            id="store-city"
            placeholder="Downtown Core District, CA 90210"
            {...register("cityStateZip")}
          />
          {errors.cityStateZip && (
            <p className="text-xs text-destructive">
              {errors.cityStateZip.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="store-phone">Phone</Label>
          <Input
            id="store-phone"
            type="tel"
            placeholder="+1 (555) 019-2834"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-email">Email</Label>
          <Input
            id="store-email"
            type="email"
            placeholder="southbay@shopcrm.internal"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-tax">Tax Rate (%)</Label>
          <Input
            id="store-tax"
            type="number"
            step="0.01"
            placeholder="9.50"
            className="tabular-nums"
            {...register("taxRate")}
          />
          {errors.taxRate && (
            <p className="text-xs text-destructive">{errors.taxRate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="manager-name">Assigned Store Manager *</Label>
          <Input
            id="manager-name"
            placeholder="Sarah Jenkins"
            {...register("managerName")}
          />
          {errors.managerName && (
            <p className="text-xs text-destructive">
              {errors.managerName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manager-email">Manager Email *</Label>
          <Input
            id="manager-email"
            type="email"
            placeholder="sarah.j@shopcrm.internal"
            {...register("managerEmail")}
          />
          {errors.managerEmail && (
            <p className="text-xs text-destructive">
              {errors.managerEmail.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="store-description">Store Tagline / Description</Label>
        <Textarea
          id="store-description"
          rows={2}
          placeholder="Omnichannel Retail Node • Flagship Showroom"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {!initialData && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-accent/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            New stores default to{" "}
            <strong className="font-semibold text-foreground">
              Inactive (Setup Phase)
            </strong>{" "}
            until POS terminal pairing and store catalog SKU mapping are
            completed.
          </span>
        </div>
      )}

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
