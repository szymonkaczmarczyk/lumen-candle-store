import { getTranslations } from "next-intl/server";
import { scentFamilies } from "@lumen/shared";
import { Link } from "@/i18n/navigation";
import { FlameMark, Wordmark } from "../brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-cream" data-header-dark>
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12 md:py-24">
        <div className="col-span-2 flex flex-col gap-6 md:col-span-1">
          <div className="flex items-end gap-4 text-gold-light">
            <FlameMark className="h-12 w-auto" />
            <Wordmark className="h-5 w-auto" />
          </div>
          <p className="type-body measure text-cream-soft">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.shopHeading")} className="flex flex-col gap-4">
          <h2 className="type-eyebrow text-gold-light">{t("footer.shopHeading")}</h2>
          <ul className="flex flex-col gap-1">
            {scentFamilies.map((family) => (
              <li key={family}>
                <Link href={{ pathname: "/shop", query: { family } }} className="type-body inline-block py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
                  {t(`families.${family}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("footer.infoHeading")} className="flex flex-col gap-4">
          <h2 className="type-eyebrow text-gold-light">{t("footer.infoHeading")}</h2>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/about" className="type-body inline-block py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
                {t("footer.about")}
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="type-body inline-block py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
                {t("footer.shipping")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="type-body inline-block py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="type-body inline-block py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
                {t("footer.privacy")}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <h2 className="type-eyebrow text-gold-light">{t("footer.contactHeading")}</h2>
          <div className="flex flex-col">
            <a href={`mailto:${t("footer.contactEmail")}`} className="type-body inline-block self-start py-2.5 text-cream-soft underline-offset-4 transition-colors hover:text-cream hover:underline">
              {t("footer.contactEmail")}
            </a>
            <a href={`tel:${t("footer.phone").replace(/\s/g, "")}`} className="type-body inline-block self-start py-2.5 text-cream-soft tabular-nums underline-offset-4 transition-colors hover:text-cream hover:underline">
              {t("footer.phone")}
            </a>
          </div>
          <LanguageSwitcher className="type-label inline-flex min-h-11 items-center self-start border-b border-cream/40 text-cream-soft transition-colors hover:text-cream" />
        </div>
      </div>
      <div className="border-t border-night-soft">
        <div className="container-page py-6">
          <p className="type-caption text-center text-cream-soft">{t("footer.rights", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
