"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database,
  Loader2,
  RotateCcw,
  Server,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  useResetMockDataset,
  useUpdateWorkspaceSettings,
  useWorkspaceSettings,
} from "@/features/settings/api/settings.queries";
import {
  workspaceSettingsSchema,
  type WorkspaceSettingsFormValues,
} from "@/features/settings/schemas/settings.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";

export function WorkspaceSettingsView() {
  const { setActiveStoreId } = useActiveStore();
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspaceSettings();

  const updateMutation = useUpdateWorkspaceSettings();
  const resetMutation = useResetMockDataset();
  const [confirmResetOpen, setConfirmResetOpen] = React.useState(false);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<WorkspaceSettingsFormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      organizationName: "Shop CRM Retail Group",
      primaryContactEmail: "sarah.j@shopcrm.internal",
      clusterRegion: "US-EAST",
      defaultTaxRate: 9.5,
      defaultLowStockThreshold: 10,
      posAutoSyncEnabled: true,
      enforceUniqueSkuPerStore: true,
    },
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        organizationName: settings.organizationName,
        primaryContactEmail: settings.primaryContactEmail,
        clusterRegion: settings.clusterRegion as
          | "US-EAST"
          | "US-WEST"
          | "EU-CENTRAL"
          | "AP-SOUTHEAST",
        defaultTaxRate: settings.defaultTaxRate,
        defaultLowStockThreshold: settings.defaultLowStockThreshold,
        posAutoSyncEnabled: settings.posAutoSyncEnabled,
        enforceUniqueSkuPerStore: settings.enforceUniqueSkuPerStore,
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <ErrorState
        title="Unable to load workspace settings"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const onSubmit = (values: WorkspaceSettingsFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Saved workspace settings");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Tenant Instance #{settings.tenantId}
        </span>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-foreground leading-tight">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure multi-store tenant defaults, inventory validation rules, and
          API data state.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Organization & POS</TabsTrigger>
          <TabsTrigger value="data">API & Dataset Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input id="org-name" {...register("organizationName")} />
                  {errors.organizationName && (
                    <p className="text-xs text-destructive">
                      {errors.organizationName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org-email">Primary Operations Email *</Label>
                  <Input
                    id="org-email"
                    type="email"
                    {...register("primaryContactEmail")}
                  />
                  {errors.primaryContactEmail && (
                    <p className="text-xs text-destructive">
                      {errors.primaryContactEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Deployment Cluster</Label>
                  <Controller
                    control={control}
                    name="clusterRegion"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US-EAST">US-EAST</SelectItem>
                          <SelectItem value="US-WEST">US-WEST</SelectItem>
                          <SelectItem value="EU-CENTRAL">EU-CENTRAL</SelectItem>
                          <SelectItem value="AP-SOUTHEAST">
                            AP-SOUTHEAST
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="default-tax">Default Store Tax (%)</Label>
                  <Input
                    id="default-tax"
                    type="number"
                    step="0.01"
                    className="tabular-nums"
                    {...register("defaultTaxRate")}
                  />
                  {errors.defaultTaxRate && (
                    <p className="text-xs text-destructive">
                      {errors.defaultTaxRate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="default-threshold">
                    Default Low-Stock Alert
                  </Label>
                  <Input
                    id="default-threshold"
                    type="number"
                    step="1"
                    className="tabular-nums"
                    {...register("defaultLowStockThreshold")}
                  />
                  {errors.defaultLowStockThreshold && (
                    <p className="text-xs text-destructive">
                      {errors.defaultLowStockThreshold.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3.5">
                  <div>
                    <Label htmlFor="pos-sync-switch">
                      Automatic Multi-Store POS Sync
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Propagate category priority and active SKU price changes
                      to paired POS registers automatically.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="posAutoSyncEnabled"
                    render={({ field }) => (
                      <Switch
                        id="pos-sync-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3.5">
                  <div>
                    <Label htmlFor="unique-sku-switch">
                      Enforce Unique SKU Per Store
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Reject duplicate SKU codes within the same store catalog
                      with a 409 Conflict validation check.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="enforceUniqueSkuPerStore"
                    render={({ field }) => (
                      <Switch
                        id="unique-sku-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  Last saved {formatRelativeTime(settings.updatedAt)}
                </span>
                <Button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-navy">
                  <Server className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-foreground">
                    NestJS Backend Integration Contract
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    All server-state operations execute through TanStack Query
                    hooks and the centralized{" "}
                    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
                      apiRequest
                    </code>{" "}
                    HTTP client. Configure{" "}
                    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
                      NEXT_PUBLIC_API_URL
                    </code>{" "}
                    to switch directly from the local mock adapter to a live
                    NestJS REST API without modifying feature queries or UI
                    components.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-success-foreground font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      Current Transport:{" "}
                      {process.env.NEXT_PUBLIC_API_URL
                        ? `Remote HTTP (${process.env.NEXT_PUBLIC_API_URL})`
                        : "Local Stateful Mock Adapter (localStorage synced)"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-destructive-border">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive-bg text-destructive">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Reset Mock Dataset to Initial Seed
                    </h2>
                    <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
                      Clears local browser mutations and restores the original 4
                      provisioned stores, 8 categories, and seeded retail SKU
                      inventories.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={resetMutation.isPending}
                  onClick={() => setConfirmResetOpen(true)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Dataset
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Workspace Seed Dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              All stores, products, categories, and settings created or modified
              in your browser session will be replaced with the clean initial
              seed state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                resetMutation.mutate(undefined, {
                  onSuccess: () => {
                    setActiveStoreId("store-1");
                    setConfirmResetOpen(false);
                    toast.success("Workspace restored to initial seed dataset");
                  },
                  onError: (err) => toast.error(getErrorMessage(err)),
                });
              }}
            >
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
