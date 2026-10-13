import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3301";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
    locale: "pl-PL",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" } },
  ],
});
