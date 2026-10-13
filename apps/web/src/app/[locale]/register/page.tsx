import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("registerTitle"), robots: { index: false, follow: true } };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  await resolveLocale(params);
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("registerTitle")} text={t("registerText")}>
      <RegisterForm />
    </AuthShell>
  );
}
