import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,        // run sequentially — tests share DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never", outputFolder: "playwright-output/report" }], ["line"]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  },
  projects: [
    // Auth setup — runs first, saves session
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      timeout: 120_000,
    },
    // All admin tests — depend on setup
    {
      name: "admin",
      testMatch: "**/admin/**/*.spec.ts",
      dependencies: ["setup"],
      use: {
        storageState: "tests/.auth/admin.json",
      },
    },
    // Public tests — no auth needed
    {
      name: "public",
      testMatch: "**/public/**/*.spec.ts",
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
