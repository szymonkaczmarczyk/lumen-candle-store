"use client";

import { scentFamilies, type ProductSummary, type ScentFamily } from "@lumen/shared";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { ProductTile } from "./ProductTile";

interface ProductGridProps {
  products: ProductSummary[];
  heading: ReactNode;
  initialFamily?: ScentFamily | null;
  syncUrl?: boolean;
  tileHeading?: "h2" | "h3";
  prioritize?: boolean;
}

export function ProductGrid({ products, heading, initialFamily = null, syncUrl = false, tileHeading = "h3", prioritize = false }: ProductGridProps) {
  const t = useTranslations();
  const [family, setFamily] = useState<ScentFamily | null>(initialFamily);
  const families = scentFamilies.filter((value) => products.some((product) => product.family === value));
  const visible = family ? products.filter((product) => product.family === family) : products;
  const filters: { value: ScentFamily | null; label: string }[] = [{ value: null, label: t("families.all") }, ...families.map((value) => ({ value, label: t(`families.${value}`) }))];

  const select = (value: ScentFamily | null) => {
    setFamily(value);
    if (!syncUrl) return;
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("family", value);
    else url.searchParams.delete("family");
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <div className="flex flex-col">
      <div className="container-page flex flex-col gap-6 pb-6 md:flex-row md:items-end md:justify-between md:pb-8">
        {heading}
        <div role="group" aria-label={t("shop.filterLabel")} className="-mx-[var(--spacing-gutter)] flex gap-1 overflow-x-auto px-[var(--spacing-gutter)] md:mx-0 md:px-0">
          {filters.map((filter) => {
            const active = filter.value === family;
            return (
              <button
                key={filter.value ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => select(filter.value)}
                className={clsx("type-eyebrow inline-flex min-h-11 shrink-0 items-center gap-2 px-2 transition-colors", active ? "text-ink" : "text-ink-soft hover:text-ink")}
              >
                <span aria-hidden className={clsx("h-px bg-ink transition-[width] duration-300 ease-out-soft", active ? "w-4" : "w-0")} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {t("shop.count", { count: visible.length })}
      </p>
      <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {visible.map((product, index) => (
          <li key={product.id}>
            <ProductTile product={product} priority={prioritize && index < 4} headingLevel={tileHeading} />
          </li>
        ))}
      </ul>
    </div>
  );
}
