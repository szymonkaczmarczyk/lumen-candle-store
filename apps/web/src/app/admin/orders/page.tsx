import { formatPrice, orderStatuses, orderStatusSchema, type AdminOrderListItem } from "@lumen/shared";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { clsx } from "clsx";
import { StatusBadge, statusLabels } from "@/components/admin/StatusBadge";
import { getWithSession } from "@/lib/api";

export const metadata: Metadata = { title: "Zamówienia" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; query?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const raw = await searchParams;
  const status = orderStatusSchema.safeParse(raw.status).data;
  const query = raw.query?.trim().slice(0, 120) ?? "";
  const page = Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1);
  const params = new URLSearchParams({ page: String(page), ...(status ? { status } : {}), ...(query ? { query } : {}) });
  const { data } = await getWithSession<{ items: AdminOrderListItem[]; total: number; pageSize: number }>(`/admin/orders?${params}`);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const hrefWith = (next: { status?: string; page?: string }) => {
    const nextParams = new URLSearchParams();
    const nextStatus = "status" in next ? next.status : status;
    if (nextStatus) nextParams.set("status", nextStatus);
    if (query) nextParams.set("query", query);
    if (next.page && next.page !== "1") nextParams.set("page", next.page);
    const string = nextParams.toString();
    return string ? `/admin/orders?${string}` : "/admin/orders";
  };

  const tabs = [{ value: undefined, label: "Wszystkie" }, ...orderStatuses.filter((value) => value !== "PENDING").map((value) => ({ value, label: statusLabels[value] }))];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="type-h2">Zamówienia</h1>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtr statusu" className="-mx-1 overflow-x-auto px-1">
          <ul className="flex gap-2">
            {tabs.map((tab) => (
              <li key={tab.value ?? "all"}>
                <NextLink
                  href={hrefWith({ status: tab.value, page: undefined })}
                  aria-current={tab.value === status ? "page" : undefined}
                  className={clsx(
                    "type-caption inline-flex min-h-11 items-center whitespace-nowrap rounded-xs border px-3 transition-colors",
                    tab.value === status ? "border-ink bg-ink text-cream" : "border-line bg-paper hover:border-ink",
                  )}
                >
                  {tab.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
        <form action="/admin/orders" className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="order-search" className="sr-only">
            Szukaj zamówienia
          </label>
          <input
            id="order-search"
            name="query"
            defaultValue={query}
            placeholder="Numer, e-mail lub nazwisko"
            className="min-h-11 w-full rounded-xs border border-line bg-paper px-4 lg:w-72"
          />
          <button type="submit" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xs bg-ink text-cream" aria-label="Szukaj">
            <Search className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
      {data && data.items.length > 0 ? (
        <div className="overflow-x-auto rounded-xs border border-line bg-paper">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="type-eyebrow border-b border-line text-ink-soft">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Numer</th>
                <th scope="col" className="px-5 py-3 font-semibold">Data</th>
                <th scope="col" className="px-5 py-3 font-semibold">Klient</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Kwota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-sand/50">
                  <td className="px-5 py-3">
                    <NextLink href={`/admin/orders/${order.id}`} className="type-body font-medium underline-offset-2 hover:underline">
                      {order.number}
                    </NextLink>
                  </td>
                  <td className="type-caption px-5 py-3 text-ink-soft">{dateFormat.format(new Date(order.createdAt))}</td>
                  <td className="type-caption px-5 py-3">{order.email}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="type-body px-5 py-3 text-right tabular-nums">{formatPrice(order.totalGrosze, "pl")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="type-body rounded-xs border border-dashed border-line p-8 text-ink-soft">
          {query || status ? "Brak zamówień dla tych filtrów. Zmień status albo wyczyść wyszukiwanie." : "Nie ma jeszcze zamówień."}
        </p>
      )}
      {totalPages > 1 && (
        <nav aria-label="Strony" className="flex items-center justify-between">
          <NextLink
            href={hrefWith({ page: String(page - 1) })}
            aria-disabled={page <= 1}
            className={clsx("type-caption inline-flex min-h-11 items-center gap-2 rounded-xs border border-line px-3", page <= 1 && "pointer-events-none opacity-40")}
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
            Poprzednia
          </NextLink>
          <span className="type-caption text-ink-soft">
            Strona {page} z {totalPages}
          </span>
          <NextLink
            href={hrefWith({ page: String(page + 1) })}
            aria-disabled={page >= totalPages}
            className={clsx("type-caption inline-flex min-h-11 items-center gap-2 rounded-xs border border-line px-3", page >= totalPages && "pointer-events-none opacity-40")}
          >
            Następna
            <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
          </NextLink>
        </nav>
      )}
    </div>
  );
}
