import "server-only";
import type { Locale, ProductDetail, ProductSummary, ScentFamily } from "@lumen/shared";

const apiUrl = process.env.API_URL ?? "http://localhost:4300";

async function getJson<T>(path: string, revalidate: number): Promise<T | null> {
  const response = await fetch(`${apiUrl}${path}`, { next: { revalidate, tags: ["catalog"] } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API responded ${response.status} for ${path}`);
  return (await response.json()) as T;
}

export async function getProducts(locale: Locale, family?: ScentFamily): Promise<ProductSummary[]> {
  const query = new URLSearchParams({ locale, ...(family ? { family } : {}) });
  return (await getJson<ProductSummary[]>(`/products?${query}`, 60)) ?? [];
}

export function getProduct(locale: Locale, slug: string): Promise<ProductDetail | null> {
  return getJson<ProductDetail>(`/products/${encodeURIComponent(slug)}?locale=${locale}`, 30);
}

export async function getWithSession<T>(path: string): Promise<{ status: number; data: T | null }> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get("lumen_session")?.value;
  const response = await fetch(`${apiUrl}${path}`, {
    cache: "no-store",
    headers: token ? { cookie: `lumen_session=${token}` } : undefined,
  });
  if (!response.ok) return { status: response.status, data: null };
  return { status: response.status, data: (await response.json()) as T };
}

export async function getSessionUser() {
  const { data } = await getWithSession<{ user: import("@lumen/shared").SessionUser | null }>("/auth/me");
  return data?.user ?? null;
}
