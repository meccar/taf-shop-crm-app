import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-brand-navy">
        <Compass className="h-6 w-6" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
        404 · Route Not Found
      </span>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        Requested resource does not exist
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The store, product, or category route you requested may have been moved
        or removed from the workspace.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="default"
          nativeButton={false}
          render={<Link href="/" />}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/stores" />}
          className="gap-2"
        >
          View Stores
        </Button>
      </div>
    </div>
  );
}
