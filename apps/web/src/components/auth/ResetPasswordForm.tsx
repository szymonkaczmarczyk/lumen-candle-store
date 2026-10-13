"use client";

import { passwordResetConfirmSchema, passwordResetRequestSchema, type Locale } from "@lumen/shared";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/client-api";
import { FormAlert } from "../form/FormAlert";
import { PasswordField } from "../form/PasswordField";
import { TextField } from "../form/TextField";
import { buttonStyles } from "../ui/button-styles";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const locale = useLocale() as Locale;
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResult(null);
    const parsed = token
      ? passwordResetConfirmSchema.safeParse({ token, password: value })
      : passwordResetRequestSchema.safeParse({ email: value, locale });
    if (!parsed.success) {
      setFieldError(token ? tv("passwordLength") : tv("email"));
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      await apiFetch(token ? "/auth/password-reset/confirm" : "/auth/password-reset/request", { body: parsed.data });
      setResult({ tone: "success", text: token ? t("passwordChanged") : t("resetSent") });
      setValue("");
    } catch (caught) {
      const text = caught instanceof ApiError && caught.status === 429 ? t("rateLimited") : t("invalidToken");
      setResult({ tone: "error", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-md flex-col gap-5">
      {token ? (
        <PasswordField name="password" label={t("password")} autoComplete="new-password" value={value} onChange={(event) => setValue(event.target.value)} error={fieldError} hint={t("passwordHint")} required />
      ) : (
        <TextField name="email" spellCheck={false} autoCapitalize="none" label={t("email")} type="email" autoComplete="email" value={value} onChange={(event) => setValue(event.target.value)} error={fieldError} required />
      )}
      {result && <FormAlert tone={result.tone}>{result.text}</FormAlert>}
      <button type="submit" disabled={submitting} className={buttonStyles("primary")}>
        {submitting ? (token ? t("saving") : t("sending")) : token ? t("setPassword") : t("sendReset")}
      </button>
      <Link href="/login" className="type-caption self-start text-ink-soft underline underline-offset-2 hover:text-ink">
        {t("backToLogin")}
      </Link>
    </form>
  );
}
