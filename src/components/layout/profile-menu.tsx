"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/features/auth/api/auth.queries";
import { useProfileQuery } from "@/features/profile/api/profile.queries";
import { Button } from "../ui/button";

function getInitials(name?: string | null, email?: string): string {
  const source = name?.trim() || email?.trim() || "U";

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function ProfileMenu() {
  const router = useRouter();
  const tShell = useTranslations("common.shell");
  const tNav = useTranslations("common.nav");
  const tAuth = useTranslations("auth");
  const { data: profile } = useProfileQuery();
  const logoutMutation = useLogoutMutation();

  const fullName = profile?.name?.trim() || tShell("profile");
  const secondaryText = profile?.email ?? "";

  const initials = getInitials(profile?.name, profile?.email);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    toast.success(tAuth("logoutSuccess"));
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            className="flex items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-navy-foreground">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-ink leading-none">
                {fullName}
              </span>
              {secondaryText ? (
                <span className="mt-1 text-[11px] text-muted leading-none max-w-[160px] truncate">
                  {secondaryText}
                </span>
              ) : null}
            </div>
            <ChevronDown className="h-4 w-4 text-muted shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink truncate">
                {fullName}
              </span>
              {secondaryText ? (
                <span className="text-xs font-normal text-muted truncate">
                  {secondaryText}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted" />
              <span>{tNav("settings")}</span>
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive-bg focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>{tShell("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
