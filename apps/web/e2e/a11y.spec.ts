import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const pages = ["/", "/sklep", "/produkt/neroli-o-swicie", "/zamowienie", "/logowanie", "/rejestracja", "/dostawa", "/o-nas", "/regulamin", "/en"];

for (const path of pages) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).slice(0, 3).join(" | ")}`);
    expect(serious).toEqual([]);
  });
}
