import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
    { name: "mobile-chromium", use: { browserName: "chromium", viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npx next dev -p 3100 -H 127.0.0.1",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
