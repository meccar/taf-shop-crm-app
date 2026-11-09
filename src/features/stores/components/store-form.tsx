"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import {
  storeFormSchema,
  type StoreFormValues,
} from "@/features/stores/schemas/store.schema";
import type { Store } from "@/features/stores/types/store.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormActions,
  FormField,
  FormGrid,
  FormLayout,
  FormSelect,
} from "@/components/shared/form-fields";
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
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
      <FormGrid cols={3}>
        <FormField
          label="Store Name"
          required
          htmlFor="store-name"
          error={errors.name}
          className="@md:col-span-2"
        >
          <Input
            id="store-name"
            placeholder="e.g. South Bay Showroom"
            {...register("name")}
          />
        </FormField>

        <FormField
          label="Code"
          required
          htmlFor="store-code"
          error={errors.code}
        >
          <Input
            id="store-code"
            placeholder="#STR-05"
            className="font-mono uppercase"
            {...register("code")}
          />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField
          label="Store Format"
          required
          htmlFor="store-format"
          error={errors.format}
        >
          <FormSelect
            control={control}
            name="format"
            id="store-format"
            options={FORMAT_OPTIONS}
            placeholder="Select store format"
          />
        </FormField>

        <FormField
          label="Operational Status"
          required
          htmlFor="store-status"
          error={errors.status}
        >
          <FormSelect
            control={control}
            name="status"
            id="store-status"
            options={STATUS_OPTIONS}
            placeholder="Select operational status"
          />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField
          label="Street Address"
          required
          htmlFor="store-address"
          error={errors.address}
        >
          <Input
            id="store-address"
            placeholder="742 Evergreen Blvd, Suite 100"
            {...register("address")}
          />
        </FormField>

        <FormField
          label="City, State & ZIP"
          required
          htmlFor="store-city"
          error={errors.cityStateZip}
        >
          <Input
            id="store-city"
            placeholder="Downtown Core District, CA 90210"
            {...register("cityStateZip")}
          />
        </FormField>
      </FormGrid>

      <FormGrid cols={3}>
        <FormField label="Phone" htmlFor="store-phone" error={errors.phone}>
          <Input
            id="store-phone"
            type="tel"
            placeholder="+1 (555) 019-2834"
            {...register("phone")}
          />
        </FormField>

        <FormField label="Email" htmlFor="store-email" error={errors.email}>
          <Input
            id="store-email"
            type="email"
            placeholder="southbay@shopcrm.internal"
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Tax Rate (%)"
          htmlFor="store-tax"
          error={errors.taxRate}
        >
          <Input
            id="store-tax"
            type="number"
            step="0.01"
            placeholder="9.50"
            className="tabular-nums"
            {...register("taxRate")}
          />
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField
          label="Assigned Store Manager"
          required
          htmlFor="manager-name"
          error={errors.managerName}
        >
          <Input
            id="manager-name"
            placeholder="Sarah Jenkins"
            {...register("managerName")}
          />
        </FormField>

        <FormField
          label="Manager Email"
          required
          htmlFor="manager-email"
          error={errors.managerEmail}
        >
          <Input
            id="manager-email"
            type="email"
            placeholder="sarah.j@shopcrm.internal"
            {...register("managerEmail")}
          />
        </FormField>
      </FormGrid>

      <FormField
        label="Store Tagline / Description"
        htmlFor="store-description"
        error={errors.description}
      >
        <Textarea
          id="store-description"
          rows={2}
          placeholder="Omnichannel Retail Node • Flagship Showroom"
          {...register("description")}
        />
      </FormField>

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

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </FormLayout>
  );
}
