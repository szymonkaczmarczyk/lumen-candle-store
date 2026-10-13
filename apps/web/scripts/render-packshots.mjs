import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const webUrl = process.env.WEB_URL ?? "http://localhost:3300";
const apiUrl = process.env.API_URL ?? "http://localhost:4300";
const outputDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/products");
const only = process.env.ONLY_SHOTS?.split(",");
const allShots = [
  { suffix: "color", view: "front", backdrop: "color", flame: "light" },
  { suffix: "neutral", view: "front", backdrop: "neutral", flame: "off" },
  { suffix: "top", view: "top", backdrop: "color", flame: "light" },
  { suffix: "hero", view: "hero", backdrop: "deep", flame: "light", width: 1600, height: 1000 },
];
const shots = only ? allShots.filter((shot) => only.includes(shot.suffix)) : allShots;

const products = await (await fetch(`${apiUrl}/products?locale=pl`)).json();
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 1250 }, deviceScaleFactor: 1.6 });

for (const product of products) {
  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width ?? 1000, height: shot.height ?? 1250 });
    const query = new URLSearchParams({ glass: product.accentColor, name: product.name, caption: "180 g", view: shot.view, backdrop: shot.backdrop, flame: shot.flame });
    await page.goto(`${webUrl}/studio?${query}`, { waitUntil: "networkidle" });
    await page.waitForSelector("canvas");
    await page.waitForTimeout(2500);
    const png = await page.locator("canvas").screenshot({ type: "png" });
    const file = path.join(outputDirectory, `${product.slug}-${shot.suffix}.webp`);
    const size = shot.width ? { width: 2400, height: 1500 } : { width: 1200, height: 1500 };
    await sharp(png).resize(size.width, size.height, { fit: "cover" }).webp(shot.width ? { quality: 92, smartSubsample: true } : { quality: 84 }).toFile(file);
    console.log("rendered", path.basename(file));
  }
}

await browser.close();
