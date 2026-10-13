import { describe, expect, it } from "vitest";
import { formatPrice } from "./money.js";
import { shippingCostGrosze } from "./shipping.js";

const normalizeSpaces = (value: string) => value.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formats whole złoty without decimals in Polish", () => {
    expect(normalizeSpaces(formatPrice(14900, "pl"))).toBe("149 zł");
  });

  it("keeps grosze when present", () => {
    expect(normalizeSpaces(formatPrice(1499, "pl"))).toBe("14,99 zł");
  });

  it("uses English formatting for the en locale", () => {
    expect(normalizeSpaces(formatPrice(14900, "en"))).toBe("PLN 149");
  });
});

describe("shippingCostGrosze", () => {
  it("charges the method price below the free threshold", () => {
    expect(shippingCostGrosze("COURIER", 29999)).toBe(1999);
  });

  it("is free from the threshold upwards", () => {
    expect(shippingCostGrosze("PARCEL_LOCKER", 30000)).toBe(0);
  });
});
