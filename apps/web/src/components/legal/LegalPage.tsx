import { intlLocale, type Locale } from "@lumen/shared";
import { getTranslations } from "next-intl/server";
import type { LegalDocument } from "@/content/legal/types";

export async function LegalPage({ document, locale }: { document: LegalDocument; locale: Locale }) {
  const t = await getTranslations("legal");
  const updated = new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" }).format(new Date(document.updatedAt));

  return (
    <div className="container-page grid gap-12 pb-24 pt-12 md:pb-40 md:pt-20 lg:grid-cols-[16rem_1fr] lg:gap-20">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label={t("toc")} className="flex flex-col gap-3">
          <p className="type-eyebrow text-ink-soft">{t("toc")}</p>
          <ol className="flex flex-col gap-1">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="type-caption inline-flex min-h-9 items-center text-ink-soft transition-colors hover:text-ink">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <article className="flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="type-h1">{document.title}</h1>
          <p className="type-caption text-ink-soft">{t("updated", { date: updated })}</p>
        </header>
        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="flex scroll-mt-28 flex-col gap-4">
            <h2 className="type-h4">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="type-body measure text-ink-soft">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
