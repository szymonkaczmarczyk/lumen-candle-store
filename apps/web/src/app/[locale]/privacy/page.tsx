import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacy } from "@/content/legal/privacy";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: {
      canonical: locale === "pl" ? "/polityka-prywatnosci" : "/en/privacy-policy",
      languages: { pl: "/polityka-prywatnosci", en: "/en/privacy-policy" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return <LegalPage document={privacy[locale]} locale={locale} />;
}
