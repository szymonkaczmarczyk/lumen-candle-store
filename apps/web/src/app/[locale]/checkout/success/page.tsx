import { formatPrice, type OrderView } from "@lumen/shared";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ClearCart, RefreshWhilePending } from "@/components/checkout/SuccessEffects";
import { buttonStyles } from "@/components/ui/button-styles";
import { Link } from "@/i18n/navigation";
import { getSessionUser } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment_intent?: string; payment_intent_client_secret?: string }>;
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("successTitle"), robots: { index: false, follow: false } };
}

async function loadOrder(paymentIntent?: string, clientSecret?: string): Promise<OrderView | null> {
  if (!paymentIntent || !clientSecret) return null;
  const query = new URLSearchParams({ paymentIntent, clientSecret });
  const response = await fetch(`${process.env.API_URL ?? "http://localhost:4300"}/checkout/confirmation?${query}`, { cache: "no-store" });
  return response.ok ? ((await response.json()) as OrderView) : null;
}

export default async function CheckoutSuccessPage({ params, searchParams }: SuccessPageProps) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("success");
  const tStatus = await getTranslations("account.status");
  const { payment_intent: paymentIntent, payment_intent_client_secret: clientSecret } = await searchParams;
  const [order, user] = await Promise.all([loadOrder(paymentIntent, clientSecret), getSessionUser()]);

  if (!order) {
    return (
      <div className="container-page flex min-h-[60svh] flex-col items-start justify-center gap-6 py-24">
        <h1 className="type-h2">{t("notFound")}</h1>
        <Link href="/shop" className={buttonStyles("primary")}>
          {t("continue")}
        </Link>
      </div>
    );
  }

  const paid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";
  const failed = order.status === "FAILED" || order.status === "CANCELLED";
  const Icon = paid ? CircleCheck : failed ? CircleAlert : LoaderCircle;

  return (
    <div className="container-page grid gap-12 pb-24 pt-12 md:pb-40 md:pt-20 lg:grid-cols-[1.2fr_1fr]">
      {paid && <ClearCart />}
      <RefreshWhilePending pending={order.status === "PENDING"} />
      <div className="flex flex-col items-start gap-6">
        <Icon className={paid ? "size-10 text-success" : failed ? "size-10 text-danger" : "size-10 animate-spin text-gold-text"} strokeWidth={1.25} aria-hidden />
        <p className="type-eyebrow text-gold-text">{t("eyebrow")}</p>
        <h1 className="type-h1">{paid ? t("title") : failed ? t("failedTitle") : t("processingTitle")}</h1>
        <p className="type-body-lg measure text-ink-soft">
          {paid ? t("text", { email: order.email }) : failed ? t("failedText") : t("processingText")}
        </p>
        <div className="flex flex-wrap gap-3">
          {failed ? (
            <Link href="/checkout" className={buttonStyles("primary")}>
              {t("retry")}
            </Link>
          ) : (
            <Link href="/shop" className={buttonStyles("primary")}>
              {t("continue")}
            </Link>
          )}
          {!user && paid && (
            <Link href="/register" className={buttonStyles("outline")}>
              {t("createAccount")}
            </Link>
          )}
        </div>
      </div>
      <aside className="flex flex-col gap-6 rounded-xs border border-line bg-paper p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="type-eyebrow text-ink-soft">{t("orderNumber")}</p>
            <p className="type-h4">{order.number}</p>
          </div>
          <span className="type-caption rounded-xs bg-sand px-2 py-1">{tStatus(order.status)}</span>
        </div>
        <ul className="flex flex-col gap-3 border-t border-line pt-5">
          {order.items.map((item) => (
            <li key={`${item.productName}-${item.variantLabel}`} className="flex justify-between gap-4">
              <span className="type-body">
                {item.productName} <span className="text-ink-soft">{item.variantLabel} × {item.quantity}</span>
              </span>
              <span className="type-body tabular-nums">{formatPrice(item.unitPriceGrosze * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-ink pt-4">
          <span className="type-h4">{formatPrice(order.totalGrosze, locale)}</span>
        </div>
        <div>
          <p className="type-eyebrow mb-2 text-ink-soft">{t("deliveryTo")}</p>
          <p className="type-body">
            {order.shipping.firstName} {order.shipping.lastName}
            <br />
            {order.shipping.parcelLockerCode ?? order.shipping.line1}
            <br />
            {order.shipping.postalCode} {order.shipping.city}
          </p>
        </div>
      </aside>
    </div>
  );
}
