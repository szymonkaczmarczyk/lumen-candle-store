"use client";

import { maxQuantityPerLine } from "@lumen/shared";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
  tone?: "light" | "dark";
}

export function QuantityStepper({ value, onChange, max = maxQuantityPerLine, size = "md", tone = "light" }: QuantityStepperProps) {
  const t = useTranslations("product");
  const buttonClass = `${size === "md" ? "size-11" : "size-11 sm:size-9"} ${tone === "dark" ? "hover:bg-cream/10" : "hover:bg-sand"}`;

  return (
    <div
      className={`inline-flex items-center rounded-xs border ${tone === "dark" ? "border-cream/15 text-cream" : "border-line bg-paper"}`}
      role="group"
      aria-label={t("quantity")}
    >
      <button
        type="button"
        className={`${buttonClass} inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t("decrease")}
      >
        <Minus className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
      <output className="type-body min-w-8 text-center tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={`${buttonClass} inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t("increase")}
      >
        <Plus className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
