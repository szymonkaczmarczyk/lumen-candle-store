import { expect, test } from "./fixtures";

test.describe("accounts", () => {
  test("register, see the account, log out and log back in", async ({ page }, testInfo) => {
    const email = `e2e-${testInfo.project.name}-${Date.now()}@lumen.test`;
    const password = "e2e-password-123";
    await page.goto("/rejestracja");
    await page.getByLabel("Imię").fill("Ola");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Hasło", { exact: true }).fill(password);
    await page.getByText("Akceptuję").click();
    await page.getByRole("button", { name: "Załóż konto" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dzień dobry, Ola");

    await page.getByRole("button", { name: "Wyloguj się" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/logowanie");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Hasło", { exact: true }).fill("wrong-password-1");
    await page.getByRole("button", { name: "Zaloguj się" }).click();
    await expect(page.getByText("Nieprawidłowy e-mail lub hasło.")).toBeVisible();

    await page.getByLabel("Hasło", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Zaloguj się" }).click();
    await expect(page).toHaveURL(/\/konto$/);
  });

  test("password field can be revealed", async ({ page }) => {
    await page.goto("/logowanie");
    const field = page.getByLabel("Hasło", { exact: true });
    await expect(field).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Pokaż hasło" }).click();
    await expect(field).toHaveAttribute("type", "text");
  });
});
