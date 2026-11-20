import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE_NAME } from "./config";
import { getMergedMessages } from "./messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isAppLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: getMergedMessages(locale),
  };
});
