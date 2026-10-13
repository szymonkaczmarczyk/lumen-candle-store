import { expect, test } from "./fixtures";

test.describe("shop", () => {
  test("lists the collection and filters by scent family with a shareable URL", async ({ page }) => {
    await page.goto("/sklep");
    const tiles = page.locator("main article");
    await expect(tiles).toHaveCount(8);
    await page.getByRole("button", { name: "Drzewne" }).click();
    await expect(page.getByRole("button", { name: "Drzewne" })).toHaveAttribute("aria-pressed", "true");
    await expect(tiles).toHaveCount(2);
    await expect(page).toHaveURL(/family=WOODY/);
  });

  test("deep link preselects the family", async ({ page }) => {
    await page.goto("/sklep?family=FLORAL");
    await expect(page.getByRole("button", { name: "Kwiatowe" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main article")).toHaveCount(1);
  });
});
