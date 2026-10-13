import { useTranslations } from "next-intl";
import { FlameMark } from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/button-styles";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="container-page flex min-h-[70svh] flex-col items-start justify-center gap-6 py-24">
      <FlameMark className="h-16 w-auto text-gold opacity-40" />
      <p className="type-eyebrow text-gold-text">{t("eyebrow")}</p>
      <h1 className="type-h1">{t("title")}</h1>
      <p className="type-body-lg measure text-ink-soft">{t("text")}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className={buttonStyles("primary")}>
          {t("cta")}
        </Link>
        <Link href="/" className={buttonStyles("outline")}>
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
