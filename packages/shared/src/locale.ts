import "./zod-setup.js";
import { z } from "zod";

export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";
export const localeSchema = z.enum(locales);

export const intlLocale: Record<Locale, string> = {
  pl: "pl-PL",
  en: "en-GB",
};
