"use client";

import {
  checkoutRequestSchema,
  formatPrice,
  shippingCostGrosze,
  shippingPriceGrosze,
  type AddressView,
  type CheckoutResponse,
  type Locale,
  type ShippingMethod,
} from "@lumen/shared";
import { Package, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { selectSubtotal, useCartHydrated, useCartStore } from "@/lib/cart-store";
import { ApiError, apiFetch } from "@/lib/client-api";
import { fieldErrorsFrom } from "@/lib/form-errors";
import { useCartSync } from "@/lib/use-cart-sync";
import { CheckboxField } from "../form/CheckboxField";
import { FormAlert } from "../form/FormAlert";
import { LegalLink } from "../form/LegalLink";
import { TextField } from "../form/TextField";
import { buttonStyles } from "../ui/button-styles";
import { OrderSummary } from "./OrderSummary";
import { PaymentStep } from "./PaymentStep";

interface CheckoutViewProps {
  userEmail: string | null;
  addresses: AddressView[];
}

interface FormState {
  email: string;
  shippingMethod: ShippingMethod;
  parcelLockerCode: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  phone: string;
  notes: string;
  acceptTerms: boolean;
  website: string;
}

const addressFields = ["firstName", "lastName", "line1", "line2", "postalCode", "city", "phone"] as const;

function fromAddress(address: AddressView | undefined) {
  if (!address) return {};
  return Object.fromEntries(addressFields.map((field) => [field, address[field] ?? ""]));
}

export function CheckoutView({ userEmail, addresses }: CheckoutViewProps) {
  const t = useTranslations("checkout");
  const tv = useTranslations("validation");
  const locale = useLocale() as Locale;
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectSubtotal);
  const { removedNotice } = useCartSync(true);
  const hydrated = useCartHydrated();
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const [form, setForm] = useState<FormState>({
    email: userEmail ?? "",
    shippingMethod: "COURIER",
    parcelLockerCode: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    phone: "",
    notes: "",
    acceptTerms: false,
    website: "",
    ...fromAddress(defaultAddress),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<CheckoutResponse | null>(null);

  const shipping = shippingCostGrosze(form.shippingMethod, subtotal);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      delete next[`address.${String(key)}`];
      return next;
    });
  };
  const errorFor = (key: string) => {
    const code = errors[key] ?? errors[`address.${key}`];
    return code ? tv(code) : undefined;
  };

  const focusFirstError = () =>
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const payload = {
      locale,
      email: form.email,
      items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      shippingMethod: form.shippingMethod,
      parcelLockerCode: form.shippingMethod === "PARCEL_LOCKER" ? form.parcelLockerCode : undefined,
      address: Object.fromEntries(addressFields.map((field) => [field, form[field]])),
      notes: form.notes,
      acceptTerms: form.acceptTerms,
      website: form.website || undefined,
    };
    const parsed = checkoutRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = fieldErrorsFrom(parsed.error);
      setErrors(fieldErrors);
      setFormError(t("fixErrors", { count: Object.keys(fieldErrors).length }));
      focusFirstError();
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch<CheckoutResponse>("/checkout", { body: payload });
      setOrder(response);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiError && error.code === "payments_unavailable") setFormError(t("paymentsUnavailable"));
      else if (error instanceof ApiError && error.code === "cart_changed") setFormError(t("cartChanged"));
      else if (error instanceof ApiError && error.code === "validation_error") {
        setErrors(fieldErrorsFrom({ issues: error.issues }));
        focusFirstError();
      } else setFormError(t("cartChanged"));
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && items.length === 0 && !order) {
    return (
      <div className="flex flex-col items-start gap-6 py-16">
        <h1 className="type-h2">{t("emptyTitle")}</h1>
        <p className="type-body-lg text-ink-soft">{t("emptyText")}</p>
        <Link href="/shop" className={buttonStyles("primary")}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="type-eyebrow text-gold-text">{t("eyebrow")}</p>
          <h1 className="type-h2">{order ? t("paymentTitle") : t("title")}</h1>
        </header>
        {removedNotice && <FormAlert tone="error">{t("cartChanged")}</FormAlert>}
        {order ? (
          <PaymentStep clientSecret={order.clientSecret} orderNumber={order.orderNumber} totalGrosze={order.totalGrosze} onBack={() => setOrder(null)} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
            <fieldset className="flex flex-col gap-5">
              <legend className="type-h4 mb-5">{t("contact")}</legend>
              <TextField name="email" spellCheck={false} autoCapitalize="none" label={t("email")} type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} error={errorFor("email")} hint={t("emailHint")} required />
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="type-h4 mb-5">{t("delivery")}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { method: "COURIER", icon: Truck, label: t("courier"), hint: t("courierHint") },
                    { method: "PARCEL_LOCKER", icon: Package, label: t("parcelLocker"), hint: t("parcelLockerHint") },
                  ] as const
                ).map(({ method, icon: Icon, label, hint }) => {
                  const active = form.shippingMethod === method;
                  const price = shippingCostGrosze(method, subtotal);
                  return (
                    <label
                      key={method}
                      className={clsx(
                        "flex cursor-pointer flex-col gap-3 rounded-xs border p-4 transition-colors duration-200",
                        active ? "border-ink bg-paper" : "border-line hover:border-ink-soft",
                      )}
                    >
                      <input type="radio" name="shippingMethod" value={method} checked={active} onChange={() => update("shippingMethod", method)} className="sr-only" />
                      <span className="flex items-center justify-between gap-3">
                        <Icon className="size-5 text-gold-text" strokeWidth={1.5} aria-hidden />
                        <span className="type-body font-medium tabular-nums">
                          {price === 0 ? (
                            <>
                              <s className="mr-2 text-ink-soft">{formatPrice(shippingPriceGrosze[method], locale)}</s>
                              {t("free")}
                            </>
                          ) : (
                            formatPrice(price, locale)
                          )}
                        </span>
                      </span>
                      <span className="type-body font-medium">{label}</span>
                      <span className="type-caption text-ink-soft">{hint}</span>
                    </label>
                  );
                })}
              </div>
              {form.shippingMethod === "PARCEL_LOCKER" && (
                <TextField
                  label={t("lockerCode")}
                  value={form.parcelLockerCode}
                  onChange={(event) => update("parcelLockerCode", event.target.value.toUpperCase())}
                  error={errorFor("parcelLockerCode")}
                  hint={t("lockerCodeHint")}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              )}
            </fieldset>

            <fieldset className="flex flex-col gap-5">
              <legend className="type-h4 mb-5">{t("address")}</legend>
              {addresses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="saved-address" className="type-caption font-medium">
                    {t("savedAddress")}
                  </label>
                  <select
                    id="saved-address"
                    defaultValue={defaultAddress?.id}
                    onChange={(event) => setForm((current) => ({ ...current, ...fromAddress(addresses.find((address) => address.id === event.target.value)) }))}
                    className="min-h-12 rounded-xs border border-line bg-paper px-4"
                  >
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.firstName} {address.lastName}, {address.line1}, {address.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="firstName" label={t("firstName")} autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} error={errorFor("firstName")} required />
                <TextField name="lastName" label={t("lastName")} autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} error={errorFor("lastName")} required />
              </div>
              <TextField name="line1" label={t("line1")} autoComplete="address-line1" value={form.line1} onChange={(event) => update("line1", event.target.value)} error={errorFor("line1")} required />
              <TextField name="line2" label={t("line2")} autoComplete="address-line2" value={form.line2} onChange={(event) => update("line2", event.target.value)} error={errorFor("line2")} />
              <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
                <TextField name="postalCode" label={t("postalCode")} autoComplete="postal-code" inputMode="numeric" placeholder="00-000" value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} error={errorFor("postalCode")} required />
                <TextField name="city" label={t("city")} autoComplete="address-level2" value={form.city} onChange={(event) => update("city", event.target.value)} error={errorFor("city")} required />
              </div>
              <TextField name="phone" label={t("phone")} type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} error={errorFor("phone")} hint={t("phoneHint")} required />
              <div className="flex flex-col gap-2">
                <label htmlFor="order-notes" className="type-caption font-medium">
                  {t("notes")}
                </label>
                <textarea
                  id="order-notes"
                  rows={3}
                  maxLength={500}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  className="rounded-xs border border-line bg-paper px-4 py-3 transition-colors hover:border-ink-soft focus-visible:border-ink"
                />
              </div>
              <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
              </div>
            </fieldset>

            <CheckboxField checked={form.acceptTerms} onChange={(value) => update("acceptTerms", value)} error={errorFor("acceptTerms")}>
              {t.rich("acceptTerms", {
                terms: (chunks) => <LegalLink href="/terms">{chunks}</LegalLink>,
                privacy: (chunks) => <LegalLink href="/privacy">{chunks}</LegalLink>,
              })}
            </CheckboxField>

            {formError && <FormAlert tone="error">{formError}</FormAlert>}
            <button type="submit" disabled={submitting || items.length === 0} className={buttonStyles("primary", "w-full")}>
              {submitting ? t("creatingOrder") : t("toPayment")}
            </button>
          </form>
        )}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary items={items} subtotalGrosze={subtotal} shippingGrosze={shipping} />
      </div>
    </div>
  );
}
