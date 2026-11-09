import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { AppProviders } from "@/app/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop CRM — Multi-Store Management SaaS",
  description:
    "Multi-store retail CRM and catalog management SaaS built with Next.js App Router, strict TypeScript, shadcn/ui, and TanStack Query.",
  openGraph: {
    title: "Shop CRM — Multi-Store Management SaaS",
    description:
      "Multi-store retail CRM and catalog management SaaS built with Next.js App Router, strict TypeScript, shadcn/ui, and TanStack Query.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
