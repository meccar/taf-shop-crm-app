"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Loader2, LoaderIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

interface FormLayoutProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

/** <form> that also acts as a container-query root for FormGrid. */
export function FormLayout({ onSubmit, children, className }: FormLayoutProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("@container space-y-4", className)}
    >
      {children}
    </form>
  );
}

// Full class strings so Tailwind can detect them.
const GRID_COLS = {
  1: "",
  2: "@md:grid-cols-2",
  3: "@md:grid-cols-3",
  5: "@md:grid-cols-5",
} as const;

interface FormGridProps {
  cols?: keyof typeof GRID_COLS;
  className?: string;
  children: React.ReactNode;
}

/** Stacks on narrow containers, goes multi-column from ~28rem wide. */
export function FormGrid({ cols = 2, className, children }: FormGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3.5", GRID_COLS[cols], className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

interface FormFieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Pass react-hook-form's `errors.fieldName` directly. */
  error?: { message?: string };
  /** Right side of the label row (e.g. an Auto-SKU button). */
  labelAction?: React.ReactNode;
  /** Muted helper text under the control. */
  hint?: React.ReactNode;
  /** Use for grid spans, e.g. "@md:col-span-2". */
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  labelAction,
  hint,
  className,
  children,
}: FormFieldProps) {
  const labelEl = (
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </Label>
  );

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      {labelAction ? (
        <div className="flex items-center justify-between gap-2">
          {labelEl}
          {labelAction}
        </div>
      ) : (
        labelEl
      )}
      {children}
      {hint && !error?.message && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error?.message && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
}

interface FieldActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  children: React.ReactNode;
}

export function FieldActionButton({
  icon: Icon,
  onClick,
  children,
}: FieldActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline"
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: SelectOption[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** react-hook-form + Base UI Select, with labels resolved via `items`. */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  options,
  id,
  placeholder,
  disabled,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          value={(field.value as string | undefined) || null}
          items={options}
          disabled={disabled}
          onValueChange={(value) => {
            if (value !== null) field.onChange(value);
          }}
        >
          <SelectTrigger id={id} className="w-full" onBlur={field.onBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

interface FormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
  className?: string;
}

export function FormActions({
  isSubmitting,
  submitLabel,
  onCancel,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2.5 border-t border-border pt-4",
        className,
      )}
    >
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
        {isSubmitting && <LoaderIcon />}
        {submitLabel}
      </Button>
    </div>
  );
}
