"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  LayoutGrid,
  Package,
  Plus,
  Settings,
  Store as StoreIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Stores", href: "/stores", icon: StoreIcon, matchPrefix: "/stores" },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    matchPrefix: "/products",
  },
  {
    label: "Categories",
    href: "/categories",
    icon: FolderTree,
    matchPrefix: "/categories",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    matchPrefix: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeStore,
    stores,
    setActiveStoreId,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useActiveStore();

  const [docsOpen, setDocsOpen] = React.useState(false);

  const isRouteActive = (item: NavItem): boolean => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false;
  };

  const handleSelectStore = (storeId: string, storeName: string) => {
    setActiveStoreId(storeId);
    toast.success(`Active store switched to ${storeName}`);
  };

  const renderSidebarBody = (collapsed: boolean, mobile = false) => (
    <div className="flex h-full flex-col justify-between bg-card select-none">
      <div className="flex flex-col">
        {/* Brand Identity Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "justify-between px-5",
          )}
        >
          <Link
            href="/"
            onClick={() => mobile && setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white shadow-xs">
              <StoreIcon className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-semibold tracking-tight text-foreground whitespace-nowrap">
                Shop CRM
              </span>
            )}
          </Link>

          {mobile && (
            <Button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Store Context Switcher */}
        <div className={cn("p-2.5", collapsed && "px-2")}>
          {collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    title={
                      activeStore
                        ? `Active Store: ${activeStore.name} (${activeStore.code})`
                        : "Switch Active Store"
                    }
                    className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-accent/60 text-brand-navy hover:bg-accent transition-colors cursor-pointer"
                  />
                }
              >
                <span className="text-[11px] font-bold tabular-nums">
                  {activeStore?.code.replace("#STR-", "S") ?? "S1"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Switch Active Store</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stores.map((store) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => handleSelectStore(store.id, store.name)}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">
                          {store.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {store.code} · {store.skuCount} SKUs
                        </span>
                      </div>
                      {store.id === activeStore?.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="rounded-lg border border-border bg-accent/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Active Store
                </span>
                <span className="text-[11px] font-medium text-brand-navy">
                  Retail
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    />
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        activeStore?.status === "ACTIVE"
                          ? "bg-primary"
                          : "bg-slate-400",
                      )}
                    />
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {activeStore?.name ?? "Loading stores..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Provisioned Locations ({stores.length})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {stores.map((store) => (
                      <DropdownMenuItem
                        key={store.id}
                        onClick={() => handleSelectStore(store.id, store.name)}
                        className="flex items-center justify-between gap-2 py-2"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-[13px] font-medium">
                            {store.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {store.code} ·{" "}
                            {store.status === "ACTIVE"
                              ? `${store.skuCount} SKUs`
                              : "Setup Phase"}
                          </span>
                        </div>
                        {store.id === activeStore?.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/stores/new");
                      }}
                      className="text-primary font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Store</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Primary Section Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="mt-1 flex flex-col gap-1 px-2.5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (mobile) setMobileMenuOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  collapsed && "mx-auto w-9 justify-center gap-0 px-0",
                  active
                    ? "bg-brand-navy text-white shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {/* No color class: the icon inherits the link's text color, so it
            always matches the label in active, hover and default states */}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {collapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Controls */}
      <div className="flex flex-col gap-1 border-t border-border p-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDocsOpen(true)}
          title={collapsed ? "Operator Guide & Shortcuts" : undefined}
          className={cn(
            "flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
            collapsed && "justify-center px-0",
          )}
        >
          <BookOpen className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Documentation</span>}
        </Button>

        {!mobile && (
          <Button
            type="button"
            variant="outline"
            onClick={toggleSidebarCollapsed}
            title={collapsed ? "Expand sidebar ([)" : "Collapse sidebar ([)"}
            className={cn(
              "flex h-9 items-center justify-between rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
              collapsed && "justify-center px-0",
            )}
          >
            <span className="flex items-center gap-3">
              {collapsed ? (
                <ChevronsRight className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <ChevronsLeft className="h-[18px] w-[18px] shrink-0" />
              )}
              {!collapsed && <span>Collapse view</span>}
            </span>
            {!collapsed && (
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                [
              </kbd>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card transition-[width] duration-150 lg:block",
          isSidebarCollapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        {renderSidebarBody(isSidebarCollapsed, false)}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-border bg-card shadow-xl">
            {renderSidebarBody(false, true)}
          </aside>
        </div>
      )}

      {/* Operator Documentation Modal */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Shop CRM — Multi-Store Operations Guide</DialogTitle>
            <DialogDescription>
              Reference guide for store scoping, catalog rules, and NestJS API
              readiness.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 text-[13px] text-muted-foreground leading-relaxed">
            <div className="rounded-lg border border-border bg-background p-3.5">
              <h4 className="font-semibold text-foreground mb-1">
                1. Active Store Context Isolation
              </h4>
              <p>
                Switching the Active Store in the left rail or Stores table
                scopes all Product listings, SKU stock counts, and Overview
                metrics strictly to that location without mixing store
                inventories.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3.5">
              <h4 className="font-semibold text-foreground mb-1">
                2. Multi-Store Category Hierarchy & Safe Deletion
              </h4>
              <p>
                Categories control POS terminal tab ordering and can apply to
                all stores or selected locations. Categories with assigned
                products are protected against accidental deletion until
                products are reassigned.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3.5">
              <h4 className="font-semibold text-foreground mb-1">
                3. Keyboard Shortcuts
              </h4>
              <ul className="space-y-1 tabular-nums">
                <li>
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    ⌘K
                  </kbd>{" "}
                  or{" "}
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    Ctrl+K
                  </kbd>{" "}
                  — Open Global Command Search
                </li>
                <li>
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    [
                  </kbd>{" "}
                  — Toggle Sidebar Rail Collapse
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
