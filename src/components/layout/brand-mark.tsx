import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" fill="var(--navy)" />
      <path
        d="M9 12.5L16 8.5L23 12.5V20.5L16 24.5L9 20.5V12.5Z"
        stroke="var(--navy-foreground)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.5L16 16.5L23 12.5M16 16.5V24.5"
        stroke="var(--blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
