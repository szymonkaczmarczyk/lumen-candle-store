import { describe, expect, it } from "vitest";
import { checkoutRequestSchema } from "./checkout.js";

const validRequest = {
  locale: "pl",
  email: "Anna@Example.com",
  items: [{ variantId: "variant_1", quantity: 2 }],
  shippingMethod: "COURIER",
  address: {
    firstName: "Anna",
    lastName: "Nowak",
    line1: "ul. Długa 1",
    postalCode: "00-001",
    city: "Warszawa",
    phone: "+48 600 000 000",
  },
  acceptTerms: true,
};

describe("checkoutRequestSchema", () => {
  it("accepts a valid request and lowercases the email", () => {
    const result = checkoutRequestSchema.parse(validRequest);
    expect(result.email).toBe("anna@example.com");
    expect(result.address.country).toBe("PL");
  });

  it("rejects a filled honeypot", () => {
    expect(checkoutRequestSchema.safeParse({ ...validRequest, website: "spam" }).success).toBe(false);
  });

  it("requires a locker code for parcel locker shipping", () => {
    const result = checkoutRequestSchema.safeParse({ ...validRequest, shippingMethod: "PARCEL_LOCKER" });
    expect(result.success).toBe(false);
  });

  it("rejects client-sent prices by ignoring unknown fields", () => {
    const result = checkoutRequestSchema.parse({ ...validRequest, items: [{ variantId: "variant_1", quantity: 1, priceGrosze: 1 }] });
    expect(result.items[0]).toEqual({ variantId: "variant_1", quantity: 1 });
  });

  it("rejects malformed postal codes", () => {
    const result = checkoutRequestSchema.safeParse({ ...validRequest, address: { ...validRequest.address, postalCode: "00001" } });
    expect(result.success).toBe(false);
  });
});
