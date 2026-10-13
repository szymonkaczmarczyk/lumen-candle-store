import type { StockStatus } from "@lumen/shared";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";

export function StockBadge({ status }: { status: StockStatus }) {
  const t = useTranslations("common");
  const label = { IN_STOCK: t("inStock"), LOW_STOCK: t("lowStock"), OUT_OF_STOCK: t("soldOut") }[status];
  return (
    <span className="type-caption inline-flex items-center gap-2 text-ink-soft">
      <span
        aria-hidden
        className={clsx(
          "size-2 rounded-full",
          status === "IN_STOCK" && "bg-success",
          status === "LOW_STOCK" && "bg-warning",
          status === "OUT_OF_STOCK" && "bg-danger",
        )}
      />
      {label}
    </span>
  );
}
