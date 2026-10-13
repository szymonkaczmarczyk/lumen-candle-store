import { expect, test as base, type Page } from "@playwright/test";

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use(errors);
  },
});

export { expect };

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;

export async function openCart(page: Page) {
  const drawer = page.locator("dialog[open]");
  await expect(async () => {
    if ((await drawer.count()) === 0) await page.locator("[data-cart-button]").click({ timeout: 2000 });
    await expect(drawer).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}

export async function clearCart(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("lumen-cart"));
}
