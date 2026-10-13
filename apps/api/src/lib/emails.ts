import { formatPrice, type Locale } from "@lumen/shared";
import { escapeHtml } from "./html.js";
import type { MailMessage } from "./mailer.js";

interface ConfirmationOrder {
  number: string;
  email: string;
  locale: Locale;
  subtotalGrosze: number;
  shippingGrosze: number;
  totalGrosze: number;
  shipFirstName: string;
  shipLastName: string;
  shipLine1: string;
  shipLine2: string;
  shipPostalCode: string;
  shipCity: string;
  parcelLockerCode: string | null;
  items: { productName: string; variantLabel: string; unitPriceGrosze: number; quantity: number }[];
}

const copy = {
  pl: {
    subject: (number: string) => `Dziękujemy za zamówienie ${number}`,
    heading: "Dziękujemy za zamówienie",
    intro: (name: string) => `${name}, płatność została przyjęta. Przygotujemy paczkę w ciągu 1-2 dni roboczych i wyślemy numer przesyłki.`,
    orderNumber: "Numer zamówienia",
    subtotal: "Produkty",
    shipping: "Dostawa",
    free: "Gratis",
    total: "Razem",
    address: "Adres dostawy",
    locker: "Paczkomat",
    footer: "Lumen - świece zapachowe premium. Sklep w wersji developerskiej, płatność testowa.",
    resetSubject: "Ustaw nowe hasło do konta Lumen",
    resetHeading: "Nowe hasło",
    resetIntro: "Ktoś poprosił o zmianę hasła do Twojego konta. Link jest ważny przez 60 minut. Jeśli to nie Ty, zignoruj tę wiadomość.",
    resetCta: "Ustaw nowe hasło",
  },
  en: {
    subject: (number: string) => `Thank you for your order ${number}`,
    heading: "Thank you for your order",
    intro: (name: string) => `${name}, your payment has been received. We'll pack your order within 1-2 business days and send you the tracking number.`,
    orderNumber: "Order number",
    subtotal: "Items",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    address: "Delivery address",
    locker: "Parcel locker",
    footer: "Lumen - premium scented candles. Development store, test payment.",
    resetSubject: "Set a new password for your Lumen account",
    resetHeading: "New password",
    resetIntro: "Someone asked to change the password for your account. The link is valid for 60 minutes. If it wasn't you, ignore this message.",
    resetCta: "Set a new password",
  },
} as const;

const layout = (title: string, body: string, footer: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f6f1e9;font-family:Helvetica,Arial,sans-serif;color:#1c1712;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e9;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f3;border:1px solid #dfd5c6;">
<tr><td style="padding:28px 32px;border-bottom:1px solid #dfd5c6;letter-spacing:6px;font-weight:700;color:#7a5a2c;font-size:14px;">LUMEN</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #dfd5c6;font-size:12px;color:#5e554a;">${escapeHtml(footer)}</td></tr>
</table></td></tr></table></body></html>`;

export function orderConfirmationEmail(order: ConfirmationOrder): MailMessage {
  const t = copy[order.locale];
  const price = (grosze: number) => formatPrice(grosze, order.locale);
  const rows = order.items
    .map(
      (item) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #ece3d6;">${escapeHtml(item.productName)}<br><span style="color:#5e554a;font-size:13px;">${escapeHtml(item.variantLabel)} × ${item.quantity}</span></td>
<td align="right" style="padding:10px 0;border-bottom:1px solid #ece3d6;white-space:nowrap;">${price(item.unitPriceGrosze * item.quantity)}</td></tr>`,
    )
    .join("");
  const addressLines = [
    `${order.shipFirstName} ${order.shipLastName}`,
    order.parcelLockerCode ? `${t.locker}: ${order.parcelLockerCode}` : order.shipLine1,
    order.parcelLockerCode ? "" : order.shipLine2,
    `${order.shipPostalCode} ${order.shipCity}`,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");

  const body = `<h1 style="margin:0 0 12px;font-size:26px;letter-spacing:-1px;">${t.heading}</h1>
<p style="margin:0 0 24px;line-height:1.6;color:#5e554a;">${escapeHtml(t.intro(order.shipFirstName))}</p>
<p style="margin:0 0 24px;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#7a5a2c;">${t.orderNumber}: <strong>${escapeHtml(order.number)}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">${rows}
<tr><td style="padding:10px 0;color:#5e554a;">${t.subtotal}</td><td align="right">${price(order.subtotalGrosze)}</td></tr>
<tr><td style="padding:4px 0;color:#5e554a;">${t.shipping}</td><td align="right">${order.shippingGrosze === 0 ? t.free : price(order.shippingGrosze)}</td></tr>
<tr><td style="padding:12px 0;font-weight:700;border-top:1px solid #1c1712;">${t.total}</td><td align="right" style="padding:12px 0;font-weight:700;border-top:1px solid #1c1712;">${price(order.totalGrosze)}</td></tr>
</table>
<p style="margin:24px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#7a5a2c;">${t.address}</p>
<p style="margin:0;line-height:1.6;">${addressLines}</p>`;

  const text = [
    t.heading,
    t.intro(order.shipFirstName),
    `${t.orderNumber}: ${order.number}`,
    ...order.items.map((item) => `${item.productName} ${item.variantLabel} x${item.quantity}: ${price(item.unitPriceGrosze * item.quantity)}`),
    `${t.total}: ${price(order.totalGrosze)}`,
  ].join("\n");

  return { to: order.email, subject: t.subject(order.number), html: layout(t.subject(order.number), body, t.footer), text };
}

export function passwordResetEmail(email: string, resetUrl: string, locale: Locale): MailMessage {
  const t = copy[locale];
  const body = `<h1 style="margin:0 0 12px;font-size:26px;letter-spacing:-1px;">${t.resetHeading}</h1>
<p style="margin:0 0 24px;line-height:1.6;color:#5e554a;">${t.resetIntro}</p>
<a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#1c1712;color:#f3ede3;padding:14px 24px;text-decoration:none;border-radius:2px;">${t.resetCta}</a>`;
  return { to: email, subject: t.resetSubject, html: layout(t.resetSubject, body, t.footer), text: `${t.resetIntro}\n${resetUrl}` };
}
