import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,        // run sequentially — tests share DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never", outputFolder: "playwright-output/report" }], ["line"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    // Persist auth state across tests
    storageState: "tests/.auth/admin.json",
  },
  projects: [
    // Auth setup — runs first, saves session
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      use: { storageState: undefined },  // no stored state for setup
    },
    // All admin tests — depend on setup
    {
      name: "admin",
      testMatch: "**/admin/**/*.spec.ts",
      dependencies: ["setup"],
    },
    // Public tests — no auth needed
    {
      name: "public",
      testMatch: "**/public/**/*.spec.ts",
      use: { storageState: undefined },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
