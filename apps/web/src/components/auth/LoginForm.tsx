"use client";

import { loginRequestSchema } from "@lumen/shared";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/client-api";
import { FormAlert } from "../form/FormAlert";
import { PasswordField } from "../form/PasswordField";
import { TextField } from "../form/TextField";
import { buttonStyles } from "../ui/button-styles";
import { safeNextPath } from "./safe-next";

export function LoginForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = loginRequestSchema.safeParse({ email, password });
    if (!parsed.success) {
      const paths = new Set(parsed.error.issues.map((issue) => issue.path[0]));
      setFieldErrors({ email: paths.has("email") ? tv("email") : undefined, password: paths.has("password") ? tv("required") : undefined });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await apiFetch("/auth/login", { body: parsed.data });
      const next = safeNextPath(searchParams.get("next"));
      if (next) window.location.assign(next);
      else {
        router.push("/account");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 429 ? t("rateLimited") : t("invalidCredentials"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-md flex-col gap-5">
      <TextField name="email" spellCheck={false} autoCapitalize="none" label={t("email")} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} required />
      <PasswordField name="password" label={t("password")} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} required />
      <Link href="/reset-password" className="type-caption self-start text-ink-soft underline underline-offset-2 hover:text-ink">
        {t("forgot")}
      </Link>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <button type="submit" disabled={submitting} className={buttonStyles("primary")}>
        {submitting ? t("loggingIn") : t("login")}
      </button>
      <p className="type-caption text-ink-soft">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-ink underline underline-offset-2">
          {t("register")}
        </Link>
      </p>
    </form>
  );
}
