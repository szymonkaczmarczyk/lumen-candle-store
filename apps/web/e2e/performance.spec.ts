import { expect, test } from "./fixtures";

const pages = ["/", "/sklep", "/produkt/cedr-i-dym", "/dostawa"];

for (const path of pages) {
  test(`web vitals budget on ${path}`, async ({ page, consoleErrors }) => {
    await page.addInitScript(() => {
      const vitals = { cls: 0, lcp: 0 };
      (window as unknown as { __vitals: typeof vitals }).__vitals = vitals;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) vitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(path, { waitUntil: "networkidle" });
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1200);
    const vitals = await page.evaluate(() => (window as unknown as { __vitals: { cls: number; lcp: number } }).__vitals);
    expect(vitals.cls).toBeLessThan(0.1);
    expect(vitals.lcp).toBeLessThan(2500);
    const transferred = await page.evaluate(() =>
      performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
    );
    expect(transferred).toBeLessThan(1_600_000);
    expect(consoleErrors).toEqual([]);
  });
}
