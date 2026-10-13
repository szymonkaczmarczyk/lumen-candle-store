import type { ProductSummary } from "@lumen/shared";
import { getTranslations } from "next-intl/server";
import { StackMotion } from "../motion/StackMotion";
import { StackCard } from "./StackCard";

export async function FeaturedStack({ products }: { products: ProductSummary[] }) {
  const t = await getTranslations("home");

  return (
    <section id="kolekcja" className="scroll-mt-4 bg-night py-6 md:py-10" aria-label={t("heroCta")} data-header-dark>
      <StackMotion className="flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-3 overflow-x-auto px-[var(--spacing-gutter)] pb-1 md:container-page md:flex-col md:gap-0 md:overflow-visible md:pb-0">
        {products.map((product) => (
          <StackCard key={product.id} product={product} />
        ))}
      </StackMotion>
    </section>
  );
}
