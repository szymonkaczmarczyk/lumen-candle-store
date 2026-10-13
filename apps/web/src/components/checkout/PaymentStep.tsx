"use client";

import { formatPrice, type Locale } from "@lumen/shared";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { ArrowLeft, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { getPathname } from "@/i18n/navigation";
import { FormAlert } from "../form/FormAlert";
import { buttonStyles } from "../ui/button-styles";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => (stripePromise ??= loadStripe(publishableKey));

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#1c1712",
    colorBackground: "#fbf8f3",
    colorText: "#1c1712",
    colorTextSecondary: "#5e554a",
    colorDanger: "#b42318",
    fontFamily: "'DM Sans Variable', 'Helvetica Neue', Arial, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "2px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #dfd5c6", padding: "14px 16px" },
    ".Input:focus": { border: "1px solid #1c1712", boxShadow: "0 0 0 2px #7a5a2c33" },
    ".Tab": { border: "1px solid #dfd5c6" },
    ".Tab--selected": { border: "1px solid #1c1712" },
    ".Label": { fontWeight: "500" },
  },
};

interface PaymentStepProps {
  clientSecret: string;
  orderNumber: string;
  totalGrosze: number;
  onBack: () => void;
}

export function PaymentStep(props: PaymentStepProps) {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;

  if (!publishableKey) return <FormAlert tone="error">{t("paymentsUnavailable")}</FormAlert>;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret: props.clientSecret, appearance, locale }}>
      <PaymentForm {...props} />
    </Elements>
  );
}

function PaymentForm({ orderNumber, totalGrosze, onBack }: PaymentStepProps) {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const returnUrl = `${window.location.origin}${getPathname({ href: "/checkout/success", locale })}`;
    const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    if (result.error) {
      setError(result.error.message ?? t("cartChanged"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="type-caption inline-flex min-h-11 items-center gap-2 self-start text-ink-soft transition-colors hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
        {t("editDetails")}
      </button>
      <div className="flex flex-col gap-2">
        <h2 className="type-h3">{t("paymentTitle")}</h2>
        <p className="type-caption text-ink-soft">{t("orderNumber", { number: orderNumber })}</p>
      </div>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <button type="submit" disabled={!stripe || submitting} className={buttonStyles("primary", "w-full")}>
        <Lock className="size-4" strokeWidth={1.75} aria-hidden />
        {submitting ? t("paying") : t("pay", { amount: formatPrice(totalGrosze, locale) })}
      </button>
      <p className="type-caption text-center text-ink-soft">{t("secure")}</p>
    </form>
  );
}
