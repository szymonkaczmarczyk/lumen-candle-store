import { clearCart, expect, openCart, test } from "./fixtures";

test.describe("cart", () => {
  test.beforeEach(async ({ page }) => clearCart(page));

  test("quick add from a tile, change quantity, remove and keep after reload", async ({ page }) => {
    await page.goto("/sklep");
    await page.getByRole("button", { name: "Dodaj Ambra Nocturna 180 g do koszyka" }).click();
    const drawer = page.locator("dialog[open]");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Ambra Nocturna" })).toBeVisible();
    await expect(page.locator("[data-cart-button]")).toContainText("01");

    await drawer.getByRole("button", { name: "Zwiększ ilość" }).click();
    await expect(drawer).toContainText("338 zł");
    await expect(page.locator("[data-cart-button]")).toContainText("02");

    await page.reload();
    await expect(page.locator("[data-cart-button]")).toContainText("02");

    await openCart(page);
    await page.locator("dialog[open]").getByRole("button", { name: /Usuń Ambra Nocturna/ }).click();
    await expect(page.locator("dialog[open]")).toContainText("Twój koszyk jest pusty.");
  });

  test("drawer closes with Escape and the close button sits on the left", async ({ page }) => {
    await page.goto("/");
    await openCart(page);
    const drawer = page.locator("dialog[open]");
    const close = drawer.getByRole("button", { name: "Zamknij" });
    const title = drawer.getByRole("heading", { name: "Koszyk" });
    await expect(close).toBeInViewport();
    await expect(title).toBeInViewport();
    const closeBox = await close.boundingBox();
    const titleBox = await title.boundingBox();
    expect(closeBox && titleBox && closeBox.x < titleBox.x).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  });
});
