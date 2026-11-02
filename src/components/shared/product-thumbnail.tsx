"use client";

import * as React from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  imageUrl: string | null | undefined;
  name: string;
  sku?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductThumbnail({
  imageUrl,
  name,
  sku,
  size = "md",
  className,
}: ProductThumbnailProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const sizeClasses = {
    sm: "h-9 w-9 rounded-lg",
    md: "h-11 w-11 rounded-lg",
    lg: "h-36 w-36 rounded-xl",
  }[size];

  if (!imageUrl || hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-border bg-accent/70 text-brand-navy shrink-0 select-none",
          sizeClasses,
          className,
        )}
        aria-label={`${name} placeholder`}
      >
        <Package className={cn(size === "lg" ? "h-8 w-8 mb-1.5" : "h-4 w-4")} />
        {size === "lg" && sku && (
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
            {sku}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-background shrink-0",
        sizeClasses,
        className,
      )}
    >
      <img
        src={imageUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
