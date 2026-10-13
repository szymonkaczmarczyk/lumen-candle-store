"use client";

import { formatPrice, freeShippingThresholdGrosze, type Locale, type ProductSummary } from "@lumen/shared";
import { ArrowUpRight, Grip, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Link, usePathname } from "@/i18n/navigation";
import { selectItemCount, useCartStore } from "@/lib/cart-store";
import { getLenis } from "@/lib/lenis";
import { useHeaderSurface } from "@/lib/use-header-surface";
import { useHideOnScroll } from "@/lib/use-hide-on-scroll";
import { imageByRole } from "@/lib/product-images";
import { backdropFor } from "@/lib/scent-color";
import { FlameMark, Wordmark } from "../brand/Logo";
import { ProductName } from "../product/ProductName";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CandleFlame } from "../product/CandleFlame";

export function SiteHeader({ products }: { products: ProductSummary[] }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const itemCount = useCartStore(selectItemCount);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [open, setOpen] = useState(false);
  const [panelLoaded, setPanelLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [lastPathname, setLastPathname] = useState(pathname);
  const overDark = useHeaderSurface(pathname);
  const scrolledAway = useHideOnScroll();
  const [focusInside, setFocusInside] = useState(false);
  const hidden = scrolledAway && !open && !focusInside;
  const dark = overDark || open;

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    panelRef.current?.querySelector<HTMLElement>("[data-panel-first]")?.focus();
    return () => {
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const chip = clsx(
    "pointer-events-auto flex h-11 items-center rounded-xs border backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,color] duration-500 ease-out-soft",
    dark ? "border-cream/15 bg-night/35 text-cream" : "border-ink/10 bg-ivory/55 text-ink",
  );
  const quiet = dark ? "text-cream/70 hover:bg-cream/10 hover:text-cream" : "text-ink/65 hover:bg-ink/5 hover:text-ink";
  const count = String(itemCount).padStart(2, "0");

  return (
    <>
      <a href="#content" className="sr-only z-50 bg-ink px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t("skipToContent")}
      </a>
      <p id="announcement" className="type-eyebrow flex h-[var(--announcement-h)] items-center justify-center truncate bg-night px-4 text-cream-soft">
        {t("announcement", { threshold: formatPrice(freeShippingThresholdGrosze, locale) })}
      </p>
      <header
        data-hidden={hidden || undefined}
        onFocus={() => setFocusInside(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
        }}
        className={clsx(
          "pointer-events-none sticky top-0 z-40 h-[var(--header-h)] transition-[translate] duration-500 ease-out-soft",
          hidden && "-translate-y-[calc(100%+1rem)]",
        )}
      >
        <div className="relative container-page pt-3 md:pt-4">
          <div
            ref={panelRef}
            className={clsx(
              "relative rounded-xs transition-[background-color,padding,box-shadow] duration-500 ease-out-soft",
              open && "pointer-events-auto border border-cream/10 bg-night/95 p-2 shadow-[0_30px_80px_-30px_rgba(13,11,20,0.6)] backdrop-blur-xl md:p-3",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <Link href="/" aria-label={t("home")} className={clsx(chip, "gap-2.5 px-3")}>
                <FlameMark className={clsx("h-6 w-auto", dark ? "text-gold-light" : "text-gold")} />
                <Wordmark className="h-3 w-auto" />
              </Link>
              <div className={clsx(chip, "gap-1 p-1")}>
                <LanguageSwitcher className={clsx("type-label hidden h-9 items-center rounded-xs px-3 transition-colors md:inline-flex", quiet)} />
                <Link
                  href="/account"
                  aria-label={t("account")}
                  className={clsx("inline-flex size-9 items-center justify-center rounded-xs transition-colors", quiet)}
                >
                  <UserRound className="size-[18px]" strokeWidth={1.5} aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={openDrawer}
                  data-cart-button
                  className={clsx("type-label inline-flex h-9 items-center gap-2 rounded-xs px-3 transition-colors md:px-4", dark ? "bg-cream/15 hover:bg-cream/25" : "bg-ink/[0.07] hover:bg-ink/[0.12]")}
                >
                  <ShoppingBag className="size-4 sm:hidden" strokeWidth={1.75} aria-hidden />
                  <span className="max-sm:sr-only">{t("cart")}</span>
                  <span className="tabular-nums">{count}</span>
                </button>
                <button
                  ref={toggleRef}
                  type="button"
                  onClick={() => {
                    setPanelLoaded(true);
                    setOpen((value) => !value);
                  }}
                  onPointerEnter={() => setPanelLoaded(true)}
                  onFocus={() => setPanelLoaded(true)}
                  aria-expanded={open}
                  aria-controls="shop-panel"
                  className="type-label inline-flex h-9 items-center gap-2 rounded-xs bg-flame px-3 text-ink transition-colors hover:bg-flame-hover md:px-4"
                >
                  {t("shop")}
                  {open ? <X className="size-4" strokeWidth={1.75} aria-hidden /> : <Grip className="size-4" strokeWidth={1.75} aria-hidden />}
                </button>
              </div>
            </div>
            <div
              id="shop-panel"
              className={clsx(
                "grid transition-[grid-template-rows,opacity,visibility] transition-discrete duration-500 ease-out-soft",
                open ? "visible grid-rows-[1fr] opacity-100" : "pointer-events-none invisible grid-rows-[0fr] opacity-0",
              )}
              inert={!open}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="max-h-[calc(100svh-7rem)] overflow-y-auto overscroll-contain pt-2 md:pt-3" data-lenis-prevent>
                  <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-5">
                    {products.map((product, index) => {
                      const image = imageByRole(product.images, "COLOR");
                      return (
                        <li key={product.id}>
                          <Link
                            href={{ pathname: "/product/[slug]", params: { slug: product.slug } }}
                            data-panel-first={index === 0 ? true : undefined}
                            className="group flex flex-col overflow-hidden rounded-xs bg-night-soft"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: backdropFor(product.accentColor) }}>
                              {image && panelLoaded && (
                                <Image
                                  src={image.url}
                                  alt={image.alt}
                                  fill
                                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
                                  className="scale-[1.35] object-contain object-[50%_58%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.42]"
                                />
                              )}
                              {panelLoaded && (
                                <CandleFlame
                                  shot="front"
                                  fit="contain"
                                  position={[0.5, 0.58]}
                                  seed={product.slug}
                                  className="scale-[1.35] transition-transform duration-700 ease-out-soft group-hover:scale-[1.42]"
                                />
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3 border-t border-night-line px-3 py-3">
                              <ProductName name={product.name} tone="dark" className="type-caption font-medium" />
                              <span className="type-eyebrow hidden text-cream-soft md:inline">{formatPrice(product.fromPriceGrosze, locale)}</span>
                              <ArrowUpRight className="size-4 shrink-0 text-cream-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link href="/shop" className="type-label flex h-full min-h-28 items-center justify-center rounded-xs bg-night-soft text-cream transition-colors hover:bg-night-line">
                        {t("allProducts")}
                      </Link>
                    </li>
                  </ul>
                  <nav aria-label={t("home")} className="mt-2 flex flex-wrap gap-2 md:mt-3">
                    {(["/about", "/shipping", "/account"] as const).map((href) => (
                      <Link key={href} href={href} className="type-label inline-flex h-11 items-center rounded-xs bg-night-soft px-4 text-cream-soft transition-colors hover:bg-night-line hover:text-cream">
                        {t(href === "/about" ? "about" : href === "/shipping" ? "shipping" : "account")}
                      </Link>
                    ))}
                    <LanguageSwitcher className="type-label inline-flex h-11 items-center rounded-xs bg-night-soft px-4 text-cream-soft md:hidden" />
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
