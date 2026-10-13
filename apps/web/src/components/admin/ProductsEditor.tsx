"use client";

import { formatPrice, lowStockThreshold, productStatuses, type AdminProductView, type ProductStatus } from "@lumen/shared";
import { Check, CircleAlert, Star } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/client-api";

const statusLabels: Record<ProductStatus, string> = { ACTIVE: "Widoczny", DRAFT: "Szkic", ARCHIVED: "Archiwum" };
type SaveState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saved")
    return (
      <span className="type-caption inline-flex items-center gap-1 text-success" role="status">
        <Check className="size-3.5" strokeWidth={2} aria-hidden />
        Zapisano
      </span>
    );
  if (state === "error")
    return (
      <span className="type-caption inline-flex items-center gap-1 text-danger" role="alert">
        <CircleAlert className="size-3.5" strokeWidth={2} aria-hidden />
        Błąd zapisu
      </span>
    );
  if (state === "saving") return <span className="type-caption text-ink-soft">Zapisuję…</span>;
  return null;
}

function useSaver() {
  const [state, setState] = useState<SaveState>("idle");
  const save = async (path: string, body: unknown) => {
    setState("saving");
    try {
      await apiFetch(path, { method: "PATCH", body });
      setState("saved");
      window.setTimeout(() => setState("idle"), 2000);
      return true;
    } catch {
      setState("error");
      return false;
    }
  };
  return { state, save };
}

function VariantRow({ variant }: { variant: AdminProductView["variants"][number] }) {
  const { state, save } = useSaver();
  const [price, setPrice] = useState((variant.priceGrosze / 100).toFixed(2).replace(".", ","));
  const [stock, setStock] = useState(String(variant.stock));
  const [active, setActive] = useState(variant.active);
  const priceGrosze = Math.round(Number.parseFloat(price.replace(",", ".")) * 100);
  const stockValue = Number.parseInt(stock, 10);
  const valid = Number.isFinite(priceGrosze) && priceGrosze >= 100 && Number.isInteger(stockValue) && stockValue >= 0;
  const dirty = priceGrosze !== variant.priceGrosze || stockValue !== variant.stock || active !== variant.active;

  return (
    <tr className="align-middle">
      <td className="px-4 py-3">
        <span className="type-body font-medium">{variant.weightGrams} g</span>
        <span className="type-caption block text-ink-soft">{variant.sku}</span>
      </td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`price-${variant.id}`}>
          Cena w zł
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`price-${variant.id}`}
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="min-h-11 w-24 rounded-xs border border-line bg-paper px-3 tabular-nums"
          />
          <span className="type-caption text-ink-soft">zł</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`stock-${variant.id}`}>
          Stan magazynowy
        </label>
        <input
          id={`stock-${variant.id}`}
          inputMode="numeric"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          className={clsx("min-h-11 w-20 rounded-xs border bg-paper px-3 tabular-nums", stockValue <= lowStockThreshold ? "border-warning" : "border-line")}
        />
      </td>
      <td className="px-4 py-3">
        <label className="type-caption inline-flex min-h-11 cursor-pointer items-center gap-2">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-ink" />
          Aktywny
        </label>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <SaveIndicator state={state} />
          <button
            type="button"
            disabled={!dirty || !valid || state === "saving"}
            onClick={() => save(`/admin/variants/${variant.id}`, { priceGrosze, stock: stockValue, active })}
            className="type-caption inline-flex min-h-11 items-center rounded-xs bg-ink px-4 text-cream transition-opacity disabled:opacity-30"
          >
            Zapisz
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductCard({ product }: { product: AdminProductView }) {
  const { state, save } = useSaver();
  const [status, setStatus] = useState(product.status);
  const [featured, setFeatured] = useState(product.featured);
  const lowStock = product.variants.some((variant) => variant.active && variant.stock <= lowStockThreshold);

  const update = async (patch: { status?: ProductStatus; featured?: boolean }) => {
    const previous = { status, featured };
    if (patch.status) setStatus(patch.status);
    if (patch.featured !== undefined) setFeatured(patch.featured);
    const ok = await save(`/admin/products/${product.id}`, patch);
    if (!ok) {
      setStatus(previous.status);
      setFeatured(previous.featured);
    }
  };

  return (
    <li className="overflow-hidden rounded-xs border border-line bg-paper">
      <div className="flex flex-wrap items-center gap-4 border-b border-line p-4">
        <span aria-hidden className="size-8 shrink-0 rounded-xs" style={{ backgroundColor: product.accentColor }} />
        <div className="min-w-0 flex-1">
          <h2 className="type-h4">{product.name}</h2>
          <p className="type-caption text-ink-soft">
            /{product.slug} · od {formatPrice(Math.min(...product.variants.map((variant) => variant.priceGrosze)), "pl")}
            {lowStock && <span className="ml-2 text-warning">· niski stan</span>}
          </p>
        </div>
        <SaveIndicator state={state} />
        <button
          type="button"
          onClick={() => update({ featured: !featured })}
          aria-pressed={featured}
          className={clsx("type-caption inline-flex min-h-11 items-center gap-2 rounded-xs border px-3", featured ? "border-gold bg-gold/10 text-gold-text" : "border-line")}
        >
          <Star className="size-4" strokeWidth={1.5} fill={featured ? "currentColor" : "none"} aria-hidden />
          Polecany
        </button>
        <label className="sr-only" htmlFor={`status-${product.id}`}>
          Status produktu
        </label>
        <select
          id={`status-${product.id}`}
          value={status}
          onChange={(event) => update({ status: event.target.value as ProductStatus })}
          className="type-caption min-h-11 rounded-xs border border-line bg-paper px-3"
        >
          {productStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="type-eyebrow text-ink-soft">
            <tr>
              <th scope="col" className="px-4 pt-3 font-semibold">Wariant</th>
              <th scope="col" className="px-4 pt-3 font-semibold">Cena</th>
              <th scope="col" className="px-4 pt-3 font-semibold">Stan</th>
              <th scope="col" className="px-4 pt-3 font-semibold">Sprzedaż</th>
              <th scope="col" className="px-4 pt-3" />
            </tr>
          </thead>
          <tbody>
            {product.variants.map((variant) => (
              <VariantRow key={variant.id} variant={variant} />
            ))}
          </tbody>
        </table>
      </div>
    </li>
  );
}

export function ProductsEditor({ products }: { products: AdminProductView[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  );
}
