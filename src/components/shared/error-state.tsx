"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const message = getErrorMessage(error, tErrors);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive-border bg-destructive-bg/50 px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive-bg text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-ink">
        {tCommon("states.errorTitle")}
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          {tCommon("actions.retry")}
        </Button>
      ) : null}
    </div>
  );
}
