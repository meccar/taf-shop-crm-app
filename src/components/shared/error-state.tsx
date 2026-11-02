import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";

interface ErrorStateProps {
  title?: string;
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load workspace data",
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive-border bg-destructive-bg/50 px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive-bg text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-[13px] text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
