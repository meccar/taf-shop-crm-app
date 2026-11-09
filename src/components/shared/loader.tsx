import { Loader2 } from "lucide-react";

export function VerifyingLoader() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-primary">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Verifying authentication</span>
    </div>
  );
}

export function LoadingLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function LoaderIcon() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
