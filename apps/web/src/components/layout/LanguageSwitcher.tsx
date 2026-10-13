"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const targetLocale = locale === "pl" ? "en" : "pl";
  const routeParams = Object.fromEntries(Object.entries(params).filter(([key]) => key !== "locale"));
  const href = { pathname, params: routeParams } as ComponentProps<typeof Link>["href"];

  return (
    <Link href={href} locale={targetLocale} className={className} hrefLang={targetLocale} lang={targetLocale}>
      {targetLocale.toUpperCase()}
      <span className="sr-only">, {t("switchTo")}</span>
    </Link>
  );
}
