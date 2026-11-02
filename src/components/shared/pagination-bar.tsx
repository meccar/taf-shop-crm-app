"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { PaginationMeta } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  meta: PaginationMeta;
  itemLabel?: string;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange?: (nextPageSize: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationBar({
  meta,
  itemLabel = "records",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationBarProps) {
  const startItem =
    meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const endItem = Math.min(meta.page * meta.pageSize, meta.totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {onPageSizeChange && (
          <>
            <span>Rows per page:</span>
            <select
              aria-label="Rows per page"
              value={meta.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground tabular-nums focus:border-primary focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-slate-300">|</span>
          </>
        )}
        <span className="tabular-nums">
          Showing{" "}
          <strong className="font-semibold text-foreground">
            {startItem}–{endItem}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold text-foreground">
            {meta.totalItems}
          </strong>{" "}
          {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <span className="px-2.5 text-xs font-medium text-foreground tabular-nums">
          Page {meta.page} of {meta.totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
