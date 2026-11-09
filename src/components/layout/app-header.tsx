"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Package,
  RotateCcw,
  Search,
  Settings,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { APP_ASSETS } from "@/lib/constants/assets";
import { cn } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import { useDashboardSummary } from "@/features/dashboard/api/dashboard.queries";
import { useResetMockDataset } from "@/features/settings/api/settings.queries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalCommandSearch } from "@/components/layout/global-command-search";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    activeStoreId,
    activeStore,
    stores,
    setActiveStoreId,
    isSidebarCollapsed,
    setMobileMenuOpen,
  } = useActiveStore();

  const { data: dashboardSummary } = useDashboardSummary(activeStoreId);
  const resetDatasetMutation = useResetMockDataset();

  const [commandOpen, setCommandOpen] = React.useState(false);
  const [notificationsDismissed, setNotificationsDismissed] =
    React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const displayName = user?.name || "Sarah Jenkins";
  const displayEmail = user?.email || "sarah.j@shopcrm.internal";
  const displayRole = user?.role || "Operations Lead";
  const displayAvatar = user?.avatarUrl || APP_ASSETS.userAvatar;
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SJ";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out of Shop CRM");
    } finally {
      setIsLoggingOut(false);
      router.replace("/login");
    }
  };

  const lowStockItems = dashboardSummary?.lowStockItems ?? [];
  const inactiveStores = stores.filter((s) => s.status === "INACTIVE");

  const totalAlerts = notificationsDismissed
    ? 0
    : lowStockItems.length + inactiveStores.length;

  // Reset unread alert indicator if active store changes
  React.useEffect(() => {
    setNotificationsDismissed(false);
  }, [activeStoreId]);

  const segments = pathname.split("/").filter(Boolean);

  const buildBreadcrumbs = () => {
    if (segments.length === 0) {
      return [{ label: "Overview", href: "/", isCurrent: true }];
    }

    const items: Array<{ label: string; href: string; isCurrent: boolean }> =
      [];
    const rootSection = segments[0];

    const sectionTitleMap: Record<string, string> = {
      stores: "Stores",
      products: "Products",
      categories: "Categories",
      settings: "Settings",
    };

    const firstLabel = sectionTitleMap[rootSection] ?? rootSection;
    items.push({
      label: firstLabel,
      href: `/${rootSection}`,
      isCurrent: segments.length === 1,
    });

    if (segments.length >= 2) {
      const second = segments[1];
      if (second === "new") {
        items.push({
          label: "Create New",
          href: pathname,
          isCurrent: true,
        });
      } else {
        const matchedStore =
          rootSection === "stores"
            ? stores.find((s) => s.id === second)
            : undefined;
        const detailLabel = matchedStore ? matchedStore.name : "Details";
        items.push({
          label: detailLabel,
          href: `/${rootSection}/${second}`,
          isCurrent: segments.length === 2,
        });

        if (segments[2] === "edit") {
          items.push({
            label: "Edit",
            href: pathname,
            isCurrent: true,
          });
        }
      }
    }

    return items;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur-xs transition-[left] duration-150 lg:px-8",
          isSidebarCollapsed ? "lg:left-[72px]" : "lg:left-[248px]",
        )}
      >
        {/* Left Zone: Mobile Menu + Breadcrumbs + Store Context Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/">Workspace</Link>} />
              </BreadcrumbItem>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link href={crumb.href}>{crumb.label}</Link>}
                      />
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {activeStore && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-accent/70 px-2.5 py-1 text-xs font-medium text-brand-navy transition-colors hover:bg-accent cursor-pointer whitespace-nowrap shrink-0"
                  />
                }
              >
                <StoreIcon className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[140px] truncate">
                  {activeStore.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  · {activeStore.code}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Active Store Context
                  </DropdownMenuLabel>

                  {stores.map((store) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => {
                        setActiveStoreId(store.id);
                        toast.success(`Switched context to ${store.name}`);
                      }}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{store.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {store.code}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right Zone: Command Search + Notifications + Help + User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-9 items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground transition-colors hover:border-slate-300 hover:bg-background md:w-64 lg:w-72 cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="hidden md:inline truncate">
                Search products, SKUs, stores...
              </span>
            </span>
            <kbd className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </Button>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Operational notifications"
                  className="relative h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                />
              }
            >
              <Bell className="h-[18px] w-[18px]" />
              {totalAlerts > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular-nums">
                  {totalAlerts}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Store & Inventory Alerts
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Scoped to {activeStore?.name ?? "workspace"}
                  </p>
                </div>
                {totalAlerts > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNotificationsDismissed(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark read
                  </Button>
                )}
              </div>

              <div className="max-h-72 divide-y divide-border-subtle overflow-y-auto">
                {lowStockItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-background"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {item.stockQuantity === 0
                          ? `Out of stock (${item.sku})`
                          : `Low stock: ${item.stockQuantity} left (threshold ${item.lowStockThreshold})`}
                      </p>
                    </div>
                  </Link>
                ))}

                {inactiveStores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/stores/${store.id}`}
                    className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-background"
                  >
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {store.name} ({store.code})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Inactive · Setup phase pending POS activation
                      </p>
                    </div>
                  </Link>
                ))}

                {lowStockItems.length === 0 && inactiveStores.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No active stock or store setup alerts.
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Help Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Workspace help"
                  className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex cursor-pointer"
                />
              }
            >
              <HelpCircle className="h-[18px] w-[18px]" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <h4 className="text-xs font-semibold text-foreground">
                Tenant Instance #RET-994
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Data operations run through TanStack Query and the NestJS-ready
                API client. Changes persist locally across refreshes until reset
                in Settings.
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px]">
                <span className="text-muted-foreground">
                  Need clean seed data?
                </span>
                <Link
                  href="/settings"
                  className="font-medium text-primary hover:underline"
                >
                  Open Settings →
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-1.5 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                />
              }
            >
              {!avatarError ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="hidden flex-col md:flex">
                <span className="text-[13px] font-medium leading-none text-foreground">
                  {displayName}
                </span>
                <span className="mt-1 text-[11px] leading-none text-muted-foreground">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold">
                      {displayName}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {displayEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/stores")}>
                  <StoreIcon className="h-4 w-4" />
                  <span>Manage Stores</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="h-4 w-4" />
                  <span>Workspace Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={resetDatasetMutation.isPending}
                  onClick={() => {
                    resetDatasetMutation.mutate(undefined, {
                      onSuccess: () => {
                        setActiveStoreId("store-1");
                        toast.success("Seed dataset restored to initial state");
                      },
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset Seed Dataset</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <GlobalCommandSearch open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
