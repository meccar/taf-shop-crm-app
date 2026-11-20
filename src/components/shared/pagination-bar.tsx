"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/lib/api/pagination";

interface PaginationBarProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function PaginationBar({
  meta,
  onPageChange,
  onLimitChange,
}: PaginationBarProps) {
  const t = useTranslations("common.pagination");

  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  const totalPages = Math.max(meta.totalPages, 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 text-xs text-muted">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span>{t("rowsPerPage")}</span>
          <Select
            value={String(meta.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-7 w-[72px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular-nums">
          {t("showing", { from, to, total: meta.total })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("firstPage")}
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("previousPage")}
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(Math.max(1, meta.page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2.5 font-medium text-ink tabular-nums">
          {t("pageOf", { page: meta.page, totalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("nextPage")}
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("lastPage")}
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
