import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { resolveLocale } from "@/lib/locale";

interface ResetPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: ResetPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("resetTitle"), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPageProps) {
  await resolveLocale(params);
  const { token } = await searchParams;
  const t = await getTranslations("auth");
  return (
    <AuthShell title={token ? t("setPasswordTitle") : t("resetTitle")} text={token ? t("passwordHint") : t("resetText")}>
      <ResetPasswordForm token={token ?? null} />
    </AuthShell>
  );
}
