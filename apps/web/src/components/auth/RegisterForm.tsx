"use client";

import { registerRequestSchema, type Locale } from "@lumen/shared";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/client-api";
import { fieldErrorsFrom } from "@/lib/form-errors";
import { CheckboxField } from "../form/CheckboxField";
import { FormAlert } from "../form/FormAlert";
import { LegalLink } from "../form/LegalLink";
import { PasswordField } from "../form/PasswordField";
import { TextField } from "../form/TextField";
import { buttonStyles } from "../ui/button-styles";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", acceptTerms: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const payload = { ...form, locale, website: form.website || undefined };
    const parsed = registerRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/auth/register", { body: payload });
      router.push("/account");
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "email_taken") setError(t("emailTaken"));
      else if (caught instanceof ApiError && caught.status === 429) setError(t("rateLimited"));
      else setError(tCommon("errorGeneric"));
      setSubmitting(false);
    }
  };

  const message = (key: string) => (errors[key] ? tv(errors[key]) : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-md flex-col gap-5">
      <TextField name="name" label={t("name")} autoComplete="given-name" value={form.name} onChange={(event) => update("name", event.target.value)} error={message("name")} required />
      <TextField name="email" spellCheck={false} autoCapitalize="none" label={t("email")} type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} error={message("email")} required />
      <PasswordField name="password" label={t("password")} autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} error={message("password")} hint={t("passwordHint")} required />
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="register-website">Website</label>
        <input id="register-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
      </div>
      <CheckboxField checked={form.acceptTerms} onChange={(value) => update("acceptTerms", value)} error={message("acceptTerms")}>
        {t.rich("acceptTerms", {
          terms: (chunks) => <LegalLink href="/terms">{chunks}</LegalLink>,
          privacy: (chunks) => <LegalLink href="/privacy">{chunks}</LegalLink>,
        })}
      </CheckboxField>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <button type="submit" disabled={submitting} className={buttonStyles("primary")}>
        {submitting ? t("registering") : t("register")}
      </button>
      <p className="type-caption text-ink-soft">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
