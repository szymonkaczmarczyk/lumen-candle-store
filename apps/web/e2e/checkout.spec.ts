import { clearCart, expect, test } from "./fixtures";

test.describe("checkout", () => {
  test.beforeEach(async ({ page }) => clearCart(page));

  test("empty cart shows a clear next step", async ({ page }) => {
    await page.goto("/zamowienie");
    await expect(page.getByRole("heading", { name: "Koszyk jest pusty" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Przejdź do sklepu" })).toBeVisible();
  });

  test("validates fields inline, focuses the first error and keeps server prices", async ({ page }) => {
    await page.goto("/sklep");
    await page.getByRole("button", { name: "Dodaj Figa Śródziemna 180 g do koszyka" }).click();
    await page.goto("/zamowienie");
    await expect(page.getByRole("heading", { name: "Podsumowanie" })).toBeVisible();
    await page.getByRole("button", { name: "Przejdź do płatności" }).click();
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await expect(page.getByText("Wpisz poprawny adres e-mail")).toBeVisible();
    await expect(page.getByText("Wpisz kod w formacie 00-000.")).toBeVisible();

    await page.getByLabel("E-mail").fill("e2e@lumen.test");
    await page.getByLabel("Imię").fill("Ewa");
    await page.getByLabel("Nazwisko").fill("Testowa");
    await page.getByLabel("Ulica i numer").fill("ul. Polna 3");
    await page.getByLabel("Kod pocztowy").fill("30-001");
    await page.getByLabel("Miasto").fill("Kraków");
    await page.getByLabel("Telefon").fill("600100200");
    await page.getByText("Akceptuję").click();
    await page.getByRole("button", { name: "Przejdź do płatności" }).click();
    await expect(page.getByText(/Płatności są chwilowo niedostępne|Płatność/)).toBeVisible();
    await expect(page.locator("#summary-title").locator("..")).toContainText("178,99 zł");
  });
});
