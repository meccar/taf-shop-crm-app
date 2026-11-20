"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_COOKIE_NAME, type AppLocale } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common.shell");
  const l = useTranslations("common.languages");

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t("language")}
            className="gap-1.5 uppercase font-mono text-xs"
          >
            <Languages className="h-3.5 w-3.5 text-muted" />
            <span>{locale}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
          <span className="flex-1">{l("english")}</span>
          <span className="font-mono text-xs text-muted">EN</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange("vi")}>
          <span className="flex-1">{l("vietnamese")}</span>
          <span className="font-mono text-xs text-muted">VI</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
