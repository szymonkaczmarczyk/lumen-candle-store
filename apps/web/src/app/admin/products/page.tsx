import type { AdminProductView } from "@lumen/shared";
import type { Metadata } from "next";
import { ProductsEditor } from "@/components/admin/ProductsEditor";
import { getWithSession } from "@/lib/api";

export const metadata: Metadata = { title: "Produkty" };

export default async function AdminProductsPage() {
  const { data: products } = await getWithSession<AdminProductView[]>("/admin/products");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="type-h2">Produkty</h1>
        <p className="type-body measure text-ink-soft">
          Zmiany cen i stanów widać w sklepie najpóźniej po minucie. Pole stanu podświetla się na żółto, gdy zostaje 5 sztuk lub mniej.
        </p>
      </header>
      <ProductsEditor products={products ?? []} />
    </div>
  );
}
