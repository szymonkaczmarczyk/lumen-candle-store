import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("loginTitle"), robots: { index: false, follow: true } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  await resolveLocale(params);
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("loginTitle")} text={t("loginText")}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
