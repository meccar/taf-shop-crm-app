import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

const statusStyles = {
  success:
    "border-transparent bg-green-100 text-green-700 hover:bg-green-100/80 dark:text-green-600",
  warning:
    "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:text-amber-600",
  navy: "border-transparent bg-[#2563eb] text-white hover:bg-[#2563eb]/80 text-white",
} as const;

type CustomBadgeVariant = keyof typeof statusStyles;

type StatusBadgeVariant = BadgeVariant | CustomBadgeVariant;

interface StatusBadgeProps extends Omit<
  ComponentProps<typeof Badge>,
  "variant"
> {
  variant?: StatusBadgeVariant;
}

export function StatusBadge({
  variant = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const customStyle =
    variant in statusStyles
      ? statusStyles[variant as CustomBadgeVariant]
      : undefined;

  return (
    <Badge
      variant={customStyle ? "outline" : (variant as BadgeVariant)}
      className={cn(customStyle, className)}
      {...props}
    />
  );
}
