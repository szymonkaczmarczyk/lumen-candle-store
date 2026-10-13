import type { OrderStatus } from "@lumen/shared";
import { clsx } from "clsx";

export const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Oczekuje na płatność",
  PAID: "Opłacone",
  SHIPPED: "Wysłane",
  DELIVERED: "Dostarczone",
  CANCELLED: "Anulowane",
  FAILED: "Płatność nieudana",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "type-caption inline-flex items-center gap-2 whitespace-nowrap rounded-xs px-2 py-0.5",
        status === "PAID" && "bg-warning/10 text-warning",
        status === "SHIPPED" && "bg-gold/15 text-gold-text",
        status === "DELIVERED" && "bg-success/10 text-success",
        (status === "CANCELLED" || status === "FAILED") && "bg-danger/10 text-danger",
        status === "PENDING" && "bg-sand text-ink-soft",
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
