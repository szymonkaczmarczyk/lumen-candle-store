import { defaultLocale, locales } from "@lumen/shared";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/shop": { pl: "/sklep", en: "/shop" },
    "/product/[slug]": { pl: "/produkt/[slug]", en: "/product/[slug]" },
    "/cart": { pl: "/koszyk", en: "/cart" },
    "/checkout": { pl: "/zamowienie", en: "/checkout" },
    "/checkout/success": { pl: "/zamowienie/potwierdzenie", en: "/checkout/success" },
    "/account": { pl: "/konto", en: "/account" },
    "/login": { pl: "/logowanie", en: "/login" },
    "/register": { pl: "/rejestracja", en: "/register" },
    "/reset-password": { pl: "/nowe-haslo", en: "/reset-password" },
    "/about": { pl: "/o-nas", en: "/about" },
    "/shipping": { pl: "/dostawa", en: "/shipping" },
    "/privacy": { pl: "/polityka-prywatnosci", en: "/privacy-policy" },
    "/terms": { pl: "/regulamin", en: "/terms" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
