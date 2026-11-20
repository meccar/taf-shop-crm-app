"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActiveStoreId } from "@/lib/api/use-active-store";
import { useStoresListQuery } from "@/features/stores/api/store.queries";
import { cn } from "cn";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { ProfileMenu } from "./profile-menu";
import { StoreSwitcher } from "./store-scwitcher";

interface NavItem {
  href: string;
  labelKey: "overview" | "stores" | "products" | "categories" | "settings";
  icon: typeof LayoutDashboard;
  matchExact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "overview", icon: LayoutDashboard, matchExact: true },
  { href: "/stores", labelKey: "stores", icon: Store },
  { href: "/products", labelKey: "products", icon: Package },
  { href: "/categories", labelKey: "categories", icon: FolderTree },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeStoreId = useActiveStoreId();
  const { data: storesData } = useStoresListQuery({ page: 1, limit: 100 });
  const activeStore =
    storesData?.items.find((item) => item.id === activeStoreId) ?? null;

  const isActivePath = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const activeNav = NAV_ITEMS.find(isActivePath);
  const breadcrumbLabel = activeNav
    ? tCommon(`nav.${activeNav.labelKey}`)
    : tCommon("brand");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Left Sidebar Rail (248px default, 72px collapsed) */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col justify-between border-r border-line bg-surface transition-transform duration-150 lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <BrandMark />
              {!collapsed ? (
                <span className="truncate text-base font-semibold tracking-tight text-ink">
                  {tCommon("brand")}
                </span>
              ) : null}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label={tCommon("actions.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3">
            <StoreSwitcher collapsed={collapsed} />
          </div>

          <nav className="flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item);
              const label = tCommon(`nav.${item.labelKey}`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-navy text-navy-foreground"
                      : "text-muted hover:bg-surface-subtle hover:text-ink",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed ? (
                    <span className="truncate">{label}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden border-t border-line p-3 lg:block">
          <Button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-subtle hover:text-ink cursor-pointer",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {tCommon("shell.collapseSidebar")}
                </span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Column */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-150",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]",
        )}
      >
        {/* Sticky 56px Top Utility Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 lg:px-8 backdrop-blur-xs">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={tCommon("shell.openMenu")}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm min-w-0"
            >
              <Link
                href="/"
                className="text-muted hover:text-ink transition-colors whitespace-nowrap"
              >
                {tCommon("brand")}
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 text-placeholder" />
              <span className="truncate font-medium text-ink">
                {breadcrumbLabel}
              </span>
            </nav>

            {activeStore ? (
              <Badge variant="outline" className="hidden md:inline-flex">
                <span className="max-w-[180px] truncate">
                  {activeStore.name}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">
                  {activeStore.code}
                </span>
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <div className="h-5 w-px bg-line hidden sm:block" />
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
