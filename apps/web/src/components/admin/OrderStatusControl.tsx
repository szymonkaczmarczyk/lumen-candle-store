"use client";

import { allowedStatusTransitions, type OrderStatus } from "@lumen/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { FormAlert } from "../form/FormAlert";
import { buttonStyles } from "../ui/button-styles";
import { statusLabels } from "./StatusBadge";

const actionLabels: Partial<Record<OrderStatus, string>> = {
  SHIPPED: "Oznacz jako wysłane",
  DELIVERED: "Oznacz jako dostarczone",
  CANCELLED: "Anuluj zamówienie",
};

const errorMessages: Record<string, string> = {
  tracking_required: "Wpisz numer przesyłki, zanim oznaczysz zamówienie jako wysłane.",
  invalid_transition: "Tej zmiany statusu nie można wykonać. Odśwież stronę.",
};

export function OrderStatusControl({ orderId, status, trackingNumber }: { orderId: string; status: OrderStatus; trackingNumber: string | null }) {
  const router = useRouter();
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const transitions = allowedStatusTransitions[status];

  const change = async (next: OrderStatus) => {
    if (next === "CANCELLED" && !window.confirm("Anulować zamówienie? Opłacone zamówienie wróci na stan magazynowy, zwrot pieniędzy zrób w panelu Stripe.")) return;
    setPending(next);
    setError(null);
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, { method: "PATCH", body: { status: next, trackingNumber: tracking.trim() || undefined } });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? (errorMessages[caught.code] ?? "Nie udało się zmienić statusu.") : "Nie udało się zmienić statusu.");
    } finally {
      setPending(null);
    }
  };

  if (transitions.length === 0) {
    return <p className="type-caption text-ink-soft">Status „{statusLabels[status]}” jest końcowy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {transitions.includes("SHIPPED") && (
        <div className="flex flex-col gap-2">
          <label htmlFor="tracking" className="type-caption font-medium">
            Numer przesyłki
          </label>
          <input id="tracking" value={tracking} onChange={(event) => setTracking(event.target.value)} maxLength={64} className="min-h-11 rounded-xs border border-line bg-paper px-4" />
        </div>
      )}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <div className="flex flex-wrap gap-3">
        {transitions.map((next) => (
          <button
            key={next}
            type="button"
            disabled={pending !== null}
            onClick={() => change(next)}
            className={next === "CANCELLED" ? buttonStyles("outline", "border-danger text-danger hover:bg-danger hover:text-cream") : buttonStyles("primary")}
          >
            {pending === next ? "Zapisuję…" : actionLabels[next]}
          </button>
        ))}
      </div>
    </div>
  );
}
