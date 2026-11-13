import { defineConfig, devices } from "@playwright/test";

const isE2E = process.env.E2E_ISOLATED === "true";

const baseURL = isE2E ? "http://127.0.0.1:5174" : "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(isE2E
    ? {}
    : {
        webServer: {
          command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
      }),
});
