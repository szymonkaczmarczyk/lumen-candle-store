import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { terms } from "@/content/legal/terms";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: { canonical: locale === "pl" ? "/regulamin" : "/en/terms", languages: { pl: "/regulamin", en: "/en/terms" } },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return <LegalPage document={terms[locale]} locale={locale} />;
}
