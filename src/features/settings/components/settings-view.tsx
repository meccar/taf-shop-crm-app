"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileQuery } from "@/features/profile/api/profile.queries";

import { setLocaleCookie, useDisplayCurrency } from "@/lib/i18n/preferences";
import {
  AppLocale,
  DisplayCurrency,
  APP_LOCALES,
  DISPLAY_CURRENCIES,
} from "@/lib/i18n/config";

export function SettingsView() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const [currency, setCurrency] = useDisplayCurrency();
  const t = useTranslations("settings");
  const profileQuery = useProfileQuery();

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    router.refresh();
  };

  const handleCurrencyChange = (nextCurrency: DisplayCurrency) => {
    setCurrency(nextCurrency);
    toast.success(t("preferences.currencySaved", { currency: nextCurrency }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {profileQuery.isLoading ? (
              <TableSkeleton rows={3} columns={2} />
            ) : profileQuery.isError ? (
              <ErrorState
                error={profileQuery.error}
                onRetry={() => void profileQuery.refetch()}
              />
            ) : (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">{t("profile.name")}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {profileQuery.data?.name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t("profile.email")}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {profileQuery.data?.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {t("profile.customerId")}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-ink">
                    {profileQuery.data?.customerId || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t("profile.role")}</dt>
                  <dd className="mt-1 text-sm text-ink">
                    {profileQuery.data?.role || "—"}
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("preferences.title")}</CardTitle>
            <CardDescription>{t("preferences.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-locale">
                {t("preferences.language")}
              </Label>
              <Select
                value={locale}
                onValueChange={(value) =>
                  handleLocaleChange(value as AppLocale)
                }
              >
                <SelectTrigger id="settings-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APP_LOCALES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === "en" ? "English" : "Tiếng Việt"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-currency">
                {t("preferences.currency")}
              </Label>
              <Select
                value={currency}
                onValueChange={(value) =>
                  handleCurrencyChange(value as DisplayCurrency)
                }
              >
                <SelectTrigger id="settings-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPLAY_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {t(`preferences.currencies.${curr}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
