import { formatPrice, type OrderView } from "@lumen/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getWithSession } from "@/lib/api";

export const metadata: Metadata = { title: "Zamówienie" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short" });

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: order } = await getWithSession<OrderView & { notes: string }>(`/admin/orders/${encodeURIComponent(id)}`);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <NextLink href="/admin/orders" className="type-caption inline-flex min-h-11 items-center gap-2 self-start text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
        Zamówienia
      </NextLink>
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="type-h2">{order.number}</h1>
          <p className="type-caption text-ink-soft">Złożone {dateFormat.format(new Date(order.createdAt))}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col gap-4 rounded-xs border border-line bg-paper p-6" aria-labelledby="items-title">
          <h2 id="items-title" className="type-h4">
            Produkty
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={`${item.productName}-${item.variantLabel}`} className="flex justify-between gap-4 py-3">
                <span className="type-body">
                  {item.productName} <span className="text-ink-soft">{item.variantLabel} × {item.quantity}</span>
                </span>
                <span className="type-body tabular-nums">{formatPrice(item.unitPriceGrosze * item.quantity, "pl")}</span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-1 border-t border-line pt-4">
            <div className="flex justify-between"><dt className="type-caption text-ink-soft">Produkty</dt><dd className="type-body tabular-nums">{formatPrice(order.subtotalGrosze, "pl")}</dd></div>
            <div className="flex justify-between"><dt className="type-caption text-ink-soft">Dostawa</dt><dd className="type-body tabular-nums">{formatPrice(order.shippingGrosze, "pl")}</dd></div>
            <div className="flex justify-between border-t border-ink pt-3"><dt className="type-h4">Razem</dt><dd className="type-h4 tabular-nums">{formatPrice(order.totalGrosze, "pl")}</dd></div>
          </dl>
        </section>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xs border border-line bg-paper p-6" aria-labelledby="status-title">
            <h2 id="status-title" className="type-h4">
              Status
            </h2>
            {order.trackingNumber && <p className="type-caption">Numer przesyłki: {order.trackingNumber}</p>}
            <OrderStatusControl orderId={order.id} status={order.status} trackingNumber={order.trackingNumber} />
          </section>
          <section className="flex flex-col gap-3 rounded-xs border border-line bg-paper p-6" aria-labelledby="shipping-title">
            <h2 id="shipping-title" className="type-h4">
              Dostawa
            </h2>
            <p className="type-body">
              {order.shipping.method === "PARCEL_LOCKER" ? `Paczkomat ${order.shipping.parcelLockerCode}` : "Kurier"}
              <br />
              {order.shipping.firstName} {order.shipping.lastName}
              <br />
              {order.shipping.line1} {order.shipping.line2}
              <br />
              {order.shipping.postalCode} {order.shipping.city}
            </p>
            <p className="type-caption text-ink-soft">
              {order.email}
              <br />
              {order.shipping.phone}
            </p>
            {order.notes && <p className="type-caption rounded-xs bg-sand p-3">Uwagi: {order.notes}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
