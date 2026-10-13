import { clsx } from "clsx";

export function ProductName({ name, className, tone = "light" }: { name: string; className?: string; tone?: "light" | "dark" }) {
  const [first, ...rest] = name.split(" ");
  return (
    <span className={className}>
      <span className={tone === "dark" ? "text-cream" : "text-ink"}>{first}</span>
      {rest.length > 0 && <span className={clsx(tone === "dark" ? "text-cream-soft" : "text-ink-soft")}> {rest.join(" ")}</span>}
    </span>
  );
}
