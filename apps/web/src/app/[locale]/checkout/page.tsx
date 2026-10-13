import type { AddressView } from "@lumen/shared";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { getSessionUser, getWithSession } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("checkoutTitle"), robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  await resolveLocale(params);
  const user = await getSessionUser();
  const addresses = user ? ((await getWithSession<AddressView[]>("/account/addresses")).data ?? []) : [];

  return (
    <div className="container-page pb-24 pt-10 md:pb-32 md:pt-16">
      <CheckoutView userEmail={user?.email ?? null} addresses={addresses} />
    </div>
  );
}
