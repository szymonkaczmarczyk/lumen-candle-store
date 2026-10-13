import "@fontsource-variable/dm-sans";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "../globals.css";
import { ArrowLeft, LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { Wordmark } from "@/components/brand/Logo";
import { getSessionUser } from "@/lib/api";
import { alteHaas } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Panel admina", template: "%s | Lumen admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/logowanie?next=/admin");

  return (
    <html lang="pl" className={alteHaas.variable}>
      <body className="bg-ivory">
        {user.role !== "ADMIN" ? (
          <main className="container-page flex min-h-svh flex-col items-start justify-center gap-4">
            <h1 className="type-h2">Brak dostępu</h1>
            <p className="type-body text-ink-soft">To konto nie ma uprawnień administratora.</p>
            <NextLink href="/" className="type-body underline">
              Wróć do sklepu
            </NextLink>
          </main>
        ) : (
          <div className="grid min-h-svh md:grid-cols-[15rem_1fr]">
            <aside className="flex flex-col gap-8 border-b border-night-soft bg-night p-5 text-cream md:sticky md:top-0 md:h-svh md:border-b-0">
              <div className="flex items-center justify-between md:flex-col md:items-start md:gap-2">
                <Wordmark className="h-4 w-auto text-gold-light" />
                <span className="type-eyebrow text-cream-soft">Panel admina</span>
              </div>
              <nav aria-label="Panel admina" className="flex gap-1 overflow-x-auto md:flex-col">
                <AdminNavLink href="/admin" icon={<LayoutDashboard className="size-4" strokeWidth={1.5} aria-hidden />} exact>
                  Pulpit
                </AdminNavLink>
                <AdminNavLink href="/admin/orders" icon={<ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />}>
                  Zamówienia
                </AdminNavLink>
                <AdminNavLink href="/admin/products" icon={<Package className="size-4" strokeWidth={1.5} aria-hidden />}>
                  Produkty
                </AdminNavLink>
              </nav>
              <div className="mt-auto hidden flex-col gap-2 md:flex">
                <p className="type-caption text-cream-soft">{user.email}</p>
                <NextLink href="/" className="type-caption inline-flex min-h-11 items-center gap-2 text-cream-soft transition-colors hover:text-cream">
                  <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
                  Wróć do sklepu
                </NextLink>
              </div>
            </aside>
            <main className="min-w-0 p-5 md:p-10">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
