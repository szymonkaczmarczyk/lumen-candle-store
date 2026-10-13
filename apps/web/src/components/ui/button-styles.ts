import { clsx } from "clsx";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xs px-5 type-label whitespace-nowrap transition-[background-color,color,border-color,opacity,translate] duration-200 ease-out-soft active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-flame text-ink hover:bg-flame-hover",
  dark: "bg-ink text-cream hover:bg-night-soft",
  light: "bg-paper text-ink hover:bg-cream",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-cream",
  outlineLight: "border border-cream/40 text-cream hover:bg-cream hover:text-ink",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonStyles(variant: ButtonVariant = "primary", className?: string) {
  return clsx(base, variants[variant], className);
}
