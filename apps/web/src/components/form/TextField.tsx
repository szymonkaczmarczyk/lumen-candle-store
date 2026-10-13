"use client";

import { CircleAlert } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

export function TextField({ label, error, hint, trailing, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="type-caption font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(
            "min-h-12 w-full rounded-xs border bg-paper px-4 text-ink transition-colors duration-200 placeholder:text-ink-soft/60 focus:outline-none focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-gold-text",
            error ? "border-danger" : "border-line hover:border-ink-soft",
            trailing ? "pr-12" : undefined,
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} className="type-caption flex items-start gap-2 text-danger" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="type-caption text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}
