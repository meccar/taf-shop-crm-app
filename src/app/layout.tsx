import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "./providers";
import { IntlProvider } from "@/components/shared/intl-provider";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop CRM",
  description:
    "Multi-store retail operations management SaaS for stores, categories, and product catalogs.",
  openGraph: {
    title: "Shop CRM",
    description:
      "Multi-store retail operations management SaaS for stores, categories, and product catalogs.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Suspense fallback={null}>
          <IntlProvider>
            <AppProviders>{children}</AppProviders>
          </IntlProvider>
        </Suspense>
      </body>
    </html>
  );
}
