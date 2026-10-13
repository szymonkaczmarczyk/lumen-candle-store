import type { ProductSummary } from "@lumen/shared";
import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { getProducts } from "@/lib/api";
import { siteUrl } from "@/lib/site";

type Href = Parameters<typeof getPathname>[0]["href"];

const staticPages: AppPathname[] = ["/", "/shop", "/about", "/shipping", "/terms", "/privacy"];

const entry = (href: Href, priority: number): MetadataRoute.Sitemap[number] => ({
  url: `${siteUrl}${getPathname({ href, locale: "pl" })}`,
  lastModified: new Date(),
  priority,
  alternates: {
    languages: {
      pl: `${siteUrl}${getPathname({ href, locale: "pl" })}`,
      en: `${siteUrl}${getPathname({ href, locale: "en" })}`,
    },
  },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products: ProductSummary[] = await getProducts("pl").catch(() => []);
  return [
    ...staticPages.map((pathname) => entry(pathname as Href, pathname === "/" ? 1 : 0.7)),
    ...products.map((product) => entry({ pathname: "/product/[slug]", params: { slug: product.slug } }, 0.8)),
  ];
}
