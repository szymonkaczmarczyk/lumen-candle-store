import { formatPrice, type AdminOrderListItem, type AdminStats } from "@lumen/shared";
import { AlertTriangle, CalendarDays, PackageCheck, Wallet } from "lucide-react";
import NextLink from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getWithSession } from "@/lib/api";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminDashboard() {
  const [{ data: stats }, { data: orders }] = await Promise.all([
    getWithSession<AdminStats>("/admin/stats"),
    getWithSession<{ items: AdminOrderListItem[] }>("/admin/orders"),
  ]);

  const cards = [
    { label: "Zamówienia dziś", value: String(stats?.ordersToday ?? 0), icon: CalendarDays },
    { label: "Przychód 30 dni", value: formatPrice(stats?.paidRevenueGrosze30d ?? 0, "pl"), icon: Wallet },
    { label: "Do wysłania", value: String(stats?.pendingShipment ?? 0), icon: PackageCheck, href: "/admin/orders?status=PAID" },
    { label: "Niski stan", value: String(stats?.lowStockVariants ?? 0), icon: AlertTriangle, href: "/admin/products" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <h1 className="type-h2">Pulpit</h1>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const content = (
            <>
              <div className="flex items-center justify-between">
                <span className="type-caption text-ink-soft">{label}</span>
                <Icon className="size-5 text-gold-text" strokeWidth={1.5} aria-hidden />
              </div>
              <span className="type-h3 tabular-nums">{value}</span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <NextLink href={href} className="flex h-full flex-col gap-4 rounded-xs border border-line bg-paper p-5 transition-colors hover:border-ink-soft">
                  {content}
                </NextLink>
              ) : (
                <div className="flex h-full flex-col gap-4 rounded-xs border border-line bg-paper p-5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
      <section className="flex flex-col gap-4" aria-labelledby="latest-orders">
        <div className="flex items-center justify-between">
          <h2 id="latest-orders" className="type-h4">
            Ostatnie zamówienia
          </h2>
          <NextLink href="/admin/orders" className="type-caption underline underline-offset-2">
            Wszystkie zamówienia
          </NextLink>
        </div>
        {orders && orders.items.length > 0 ? (
          <ul className="divide-y divide-line rounded-xs border border-line bg-paper">
            {orders.items.slice(0, 6).map((order) => (
              <li key={order.id}>
                <NextLink href={`/admin/orders/${order.id}`} className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-sand/50 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <span className="type-body font-medium">{order.number}</span>
                  <span className="type-caption hidden text-ink-soft sm:block">{dateFormat.format(new Date(order.createdAt))}</span>
                  <StatusBadge status={order.status} />
                  <span className="type-body text-right tabular-nums">{formatPrice(order.totalGrosze, "pl")}</span>
                </NextLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body rounded-xs border border-dashed border-line p-8 text-ink-soft">
            Nie ma jeszcze zamówień. Pojawią się tutaj po pierwszej opłaconej płatności testowej.
          </p>
        )}
      </section>
    </div>
  );
}
