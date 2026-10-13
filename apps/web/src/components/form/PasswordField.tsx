"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { TextField } from "./TextField";

export function PasswordField(props: Omit<ComponentProps<typeof TextField>, "type" | "trailing">) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="inline-flex size-12 items-center justify-center text-ink-soft transition-colors hover:text-ink"
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" strokeWidth={1.5} aria-hidden /> : <Eye className="size-4" strokeWidth={1.5} aria-hidden />}
        </button>
      }
    />
  );
}
