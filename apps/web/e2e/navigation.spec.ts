import { expect, test } from "./fixtures";

test.describe("navigation", () => {
  test("home renders hero, header controls and no console errors", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Światło, które pachnie." })).toBeVisible();
    await expect(page.locator("[data-cart-button]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sklep" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("shop panel opens, lists every scent and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Sklep" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#shop-panel");
    await expect(panel.getByRole("link", { name: /Ambra Nocturna/ })).toBeVisible();
    await expect(panel.getByRole("link", { name: /Las po Deszczu/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("panel link navigates to the product page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sklep" }).click();
    await page.locator("#shop-panel").getByRole("link", { name: /Cedr i Dym/ }).click();
    await expect(page).toHaveURL(/\/produkt\/cedr-i-dym$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cedr i Dym");
  });

  test("language switch keeps the localized route", async ({ page }) => {
    await page.goto("/produkt/figa-srodziemna");
    await page.getByRole("link", { name: /English/ }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/en\/product\/figa-srodziemna$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Mediterranean Fig");
  });

  test("unknown pages show the branded 404", async ({ page }) => {
    const response = await page.goto("/to-nie-istnieje");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Ten płomień zgasł" })).toBeVisible();
  });

  test("admin redirects anonymous visitors to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/logowanie\?next=\/admin$/);
  });

  test("header hides while scrolling down and returns when scrolling up", async ({ page }) => {
    await page.goto("/sklep");
    const header = page.locator("header").first();
    await expect(header).not.toHaveAttribute("data-hidden");
    await page.mouse.wheel(0, 900);
    await expect(header).toHaveAttribute("data-hidden", "true");
    await page.mouse.wheel(0, -300);
    await expect(header).not.toHaveAttribute("data-hidden");
  });

  test("footer shows contact details as links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "kontakt@lumen.com" })).toHaveAttribute("href", "mailto:kontakt@lumen.com");
    await expect(footer.getByRole("link", { name: "+48 500 000 000" })).toHaveAttribute("href", "tel:+48500000000");
    await expect(footer).not.toContainText("developersk");
  });
});
