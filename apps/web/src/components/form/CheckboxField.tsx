"use client";

import { Check, CircleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string;
  name?: string;
}

export function CheckboxField({ checked, onChange, children, error, name }: CheckboxFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-caption flex min-h-11 cursor-pointer items-start gap-3 py-2">
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer size-5 cursor-pointer appearance-none rounded-xs border border-ink-soft bg-paper transition-colors checked:border-ink checked:bg-ink aria-invalid:border-danger"
          />
          <Check className="pointer-events-none absolute inset-0 m-auto size-3.5 text-cream opacity-0 peer-checked:opacity-100" strokeWidth={2.5} aria-hidden />
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="type-caption flex items-start gap-2 text-danger" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
