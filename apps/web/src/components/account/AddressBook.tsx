"use client";

import { addressSchema, type AddressView } from "@lumen/shared";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/client-api";
import { fieldErrorsFrom } from "@/lib/form-errors";
import { CheckboxField } from "../form/CheckboxField";
import { FormAlert } from "../form/FormAlert";
import { TextField } from "../form/TextField";
import { buttonStyles } from "../ui/button-styles";

const emptyAddress = { firstName: "", lastName: "", line1: "", line2: "", postalCode: "", city: "", phone: "", isDefault: false };
type AddressForm = typeof emptyAddress;

export function AddressBook({ addresses }: { addresses: AddressView[] }) {
  const t = useTranslations("account");
  const tc = useTranslations("checkout");
  const tv = useTranslations("validation");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (address?: AddressView) => {
    setEditing(address?.id ?? "new");
    setForm(address ? { ...emptyAddress, ...address } : emptyAddress);
    setErrors({});
    setFailure(false);
  };

  const update = (key: keyof AddressForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setSaving(true);
    setFailure(false);
    try {
      const body = { ...parsed.data, isDefault: form.isDefault };
      if (editing === "new") await apiFetch("/account/addresses", { body });
      else await apiFetch(`/account/addresses/${editing}`, { method: "PUT", body });
      setEditing(null);
      router.refresh();
    } catch {
      setFailure(true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    await apiFetch(`/account/addresses/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const message = (key: string) => (errors[key] ? tv(errors[key]) : undefined);

  return (
    <div className="flex flex-col gap-6">
      {addresses.length === 0 && editing === null && <p className="type-body text-ink-soft">{t("noAddresses")}</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="flex flex-col gap-4 rounded-xs border border-line bg-paper p-5">
            <div className="flex items-start justify-between gap-3">
              <MapPin className="size-5 text-gold-text" strokeWidth={1.5} aria-hidden />
              {address.isDefault && <span className="type-eyebrow rounded-xs bg-sand px-2 py-1">{t("default")}</span>}
            </div>
            <p className="type-body">
              {address.firstName} {address.lastName}
              <br />
              {address.line1} {address.line2}
              <br />
              {address.postalCode} {address.city}
              <br />
              <span className="text-ink-soft">{address.phone}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(address)} className="type-caption inline-flex min-h-11 items-center gap-2 rounded-xs px-3 transition-colors hover:bg-sand">
                <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
                {t("editAddress")}
              </button>
              <button type="button" onClick={() => remove(address.id)} className="type-caption inline-flex min-h-11 items-center gap-2 rounded-xs px-3 text-danger transition-colors hover:bg-danger/5">
                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
                {t("deleteAddress")}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing === null ? (
        <button type="button" onClick={() => startEdit()} className={buttonStyles("outline", "self-start")}>
          <Plus className="size-4" strokeWidth={1.5} aria-hidden />
          {t("addAddress")}
        </button>
      ) : (
        <form onSubmit={save} noValidate className="flex flex-col gap-5 rounded-xs border border-line bg-paper p-5 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="firstName" label={tc("firstName")} autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} error={message("firstName")} />
            <TextField name="lastName" label={tc("lastName")} autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} error={message("lastName")} />
          </div>
          <TextField name="line1" label={tc("line1")} autoComplete="address-line1" value={form.line1} onChange={(event) => update("line1", event.target.value)} error={message("line1")} />
          <TextField name="line2" label={tc("line2")} autoComplete="address-line2" value={form.line2} onChange={(event) => update("line2", event.target.value)} />
          <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
            <TextField name="postalCode" label={tc("postalCode")} inputMode="numeric" placeholder="00-000" value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} error={message("postalCode")} />
            <TextField name="city" label={tc("city")} value={form.city} onChange={(event) => update("city", event.target.value)} error={message("city")} />
          </div>
          <TextField name="phone" label={tc("phone")} type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} error={message("phone")} />
          <CheckboxField checked={form.isDefault} onChange={(value) => update("isDefault", value)}>
            {t("makeDefault")}
          </CheckboxField>
          {failure && <FormAlert tone="error">{tCommon("errorGeneric")}</FormAlert>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setEditing(null)} className={buttonStyles("outline")}>
              {t("cancel")}
            </button>
            <button type="submit" disabled={saving} className={buttonStyles("primary")}>
              {t("save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
