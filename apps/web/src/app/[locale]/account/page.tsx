import { formatPrice, intlLocale, type AddressView, type OrderView } from "@lumen/shared";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { AddressBook } from "@/components/account/AddressBook";
import { LogoutButton } from "@/components/account/LogoutButton";
import { buttonStyles } from "@/components/ui/button-styles";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUser, getWithSession } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("accountTitle"), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const user = await getSessionUser();
  if (!user) return redirect({ href: "/login", locale });

  const t = await getTranslations("account");
  const [{ data: orders }, { data: addresses }] = await Promise.all([
    getWithSession<OrderView[]>("/account/orders"),
    getWithSession<AddressView[]>("/account/addresses"),
  ]);
  const dateFormat = new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" });

  return (
    <div className="container-page flex flex-col gap-16 pb-24 pt-12 md:gap-24 md:pb-40 md:pt-20">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="type-h1">{t("greeting", { name: user.name })}</h1>
        <div className="flex flex-wrap gap-3">
          {user.role === "ADMIN" && (
            <NextLink href="/admin" className={buttonStyles("primary")}>
              <LayoutDashboard className="size-4" strokeWidth={1.5} aria-hidden />
              {t("adminPanel")}
            </NextLink>
          )}
          <LogoutButton />
        </div>
      </header>

      <section aria-labelledby="orders-title" className="flex flex-col gap-6">
        <h2 id="orders-title" className="type-h3">
          {t("ordersTitle")}
        </h2>
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="type-body text-ink-soft">{t("noOrders")}</p>
            <Link href="/shop" className={buttonStyles("outline")}>
              {t("noOrdersCta")}
            </Link>
          </div>
        ) : (
          <ul className="border-t border-line">
            {orders.map((order) => (
              <li key={order.id} className="border-b border-line">
                <details className="group">
                  <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 py-4 md:grid-cols-[1fr_1fr_auto_auto] [&::-webkit-details-marker]:hidden">
                    <span className="type-h4">{order.number}</span>
                    <span className="type-caption hidden text-ink-soft md:block">
                      {t("orderPlaced", { date: dateFormat.format(new Date(order.createdAt)) })}
                    </span>
                    <span className="type-caption hidden rounded-xs bg-sand px-2 py-1 md:inline-block">{t(`status.${order.status}`)}</span>
                    <span className="flex items-center gap-3">
                      <span className="type-body tabular-nums">{formatPrice(order.totalGrosze, locale)}</span>
                      <ChevronDown className="size-5 transition-transform duration-300 group-open:rotate-180" strokeWidth={1.5} aria-hidden />
                    </span>
                  </summary>
                  <div className="flex flex-col gap-3 pb-6">
                    <p className="type-caption text-ink-soft md:hidden">
                      {t(`status.${order.status}`)} · {dateFormat.format(new Date(order.createdAt))}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <li key={`${item.productName}-${item.variantLabel}`} className="type-body flex justify-between gap-4">
                          <span>
                            {item.productName} <span className="text-ink-soft">{item.variantLabel} × {item.quantity}</span>
                          </span>
                          <span className="tabular-nums">{formatPrice(item.unitPriceGrosze * item.quantity, locale)}</span>
                        </li>
                      ))}
                    </ul>
                    {order.trackingNumber && <p className="type-caption">{t("tracking", { number: order.trackingNumber })}</p>}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="addresses-title" className="flex flex-col gap-6">
        <h2 id="addresses-title" className="type-h3">
          {t("addressesTitle")}
        </h2>
        <AddressBook addresses={addresses ?? []} />
      </section>
    </div>
  );
}
