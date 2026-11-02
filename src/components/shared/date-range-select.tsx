"use client";

import * as React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DATE_RANGE_OPTIONS } from "@/lib/constants/dates";

export interface DateRangeOption {
  value: string;
  label: string;
}

interface DateRangeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: readonly DateRangeOption[];
  className?: string;
}

export function DateRangeSelect({
  value,
  onValueChange,
  options = DATE_RANGE_OPTIONS,
  className,
}: DateRangeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "Select range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            aria-label="Select date range"
            className={cn("shrink-0 justify-between gap-2", className)}
          />
        }
      >
        <CalendarDays className="h-4 w-4" />
        {selectedLabel}
        <ChevronDown className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-48 p-2">
        <div className="space-y-1">
          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select date range
          </p>
          {options.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={value === option.value ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
