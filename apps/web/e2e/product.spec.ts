import { clearCart, expect, test } from "./fixtures";

test.describe("product page", () => {
  test.beforeEach(async ({ page }) => clearCart(page));

  test("shows the name early, switches size and adds from the buy bar", async ({ page }) => {
    await page.goto("/produkt/roza-damascenska");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Róża Damasceńska");
    const bar = page.locator("[data-buybar]");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("179 zł");
    await bar.getByRole("radio", { name: /380 g/i }).click();
    await expect(bar).toContainText("299 zł");
    await bar.getByRole("button", { name: "Dodaj do koszyka" }).click();
    await expect(page.locator("dialog[open]")).toContainText("380 g");
  });

  test("buy bar never covers the end of the footer", async ({ page }) => {
    await page.goto("/produkt/cedr-i-dym");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    const footerBottom = await page.locator("footer").evaluate((footer) => {
      const last = footer.lastElementChild?.getBoundingClientRect();
      return last ? last.bottom : 0;
    });
    const barTop = await page.locator("[data-buybar] > div > div").evaluate((bar) => bar.getBoundingClientRect().top);
    expect(footerBottom).toBeLessThanOrEqual(barTop + 1);
  });

  test("sold out size is announced and cannot be added", async ({ page }) => {
    await page.goto("/produkt/tyton-i-wanilia");
    const bar = page.locator("[data-buybar]");
    await bar.getByRole("radio", { name: /380 g/i }).click();
    await expect(bar.getByRole("button", { name: "Wyprzedane" })).toBeDisabled();
  });
});
