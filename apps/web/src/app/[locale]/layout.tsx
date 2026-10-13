import { CandleFlameDefs } from "@/components/product/CandleFlame";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AppProviders } from "@/components/providers/AppProviders";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/api";
import { alteHaas } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0d0b14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("homeTitle"), template: `%s | ${t("siteName")}` },
    description: t("homeDescription"),
    applicationName: t("siteName"),
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      type: "website",
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/og-image.png"] },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const products = await getProducts(locale).catch(() => []);

  return (
    <html lang={locale} className={alteHaas.variable}>
      <body>
        <CandleFlameDefs />
        <NextIntlClientProvider>
          <AppProviders>
            <SiteHeader products={products} />
            <main id="content">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
