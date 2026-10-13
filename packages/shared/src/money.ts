import { intlLocale, type Locale } from "./locale.js";

export const currency = "PLN";

export function formatPrice(grosze: number, locale: Locale): string {
  const hasFraction = grosze % 100 !== 0;
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(grosze / 100);
}
