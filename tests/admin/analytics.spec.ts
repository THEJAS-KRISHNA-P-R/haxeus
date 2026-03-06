import { test, expect } from "@playwright/test"

test.describe("Analytics page", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("/admin/analytics")
        await expect(page.locator("h1:has-text('Analytics')")).toBeVisible({ timeout: 15_000 })
    })

    test("loads stat cards", async ({ page }) => {
        await expect(page.locator("text=TOTAL ORDERS")).toBeVisible()
        await expect(page.locator("text=TOTAL REVENUE")).toBeVisible()
        await expect(page.locator("text=CUSTOMERS")).toBeVisible()
        await expect(page.locator("text=AVG ORDER VALUE")).toBeVisible()
    })

    test("has no fake placeholder data", async ({ page }) => {
        const fakeStrings = [
            "Revenue Visualization",
            "Detailed charts and graphs showing",
            "+12%", "+8%", "+5%",
            "85%", "70%", "55%",
            "STREETWEAR", "ACCESSORIES", "LIMITED EDITION",
        ]
        for (const s of fakeStrings) {
            await expect(page.locator(`text=${s}`)).not.toBeVisible()
        }
    })

    test("range selector switches between 7d / 30d / 90d", async ({ page }) => {
        await expect(page.locator("button:has-text('30d')")).toBeVisible()
        await page.click("button:has-text('7d')")
        await page.waitForTimeout(1500)
        await expect(page.locator("button:has-text('7d')")).toBeVisible()
        await page.click("button:has-text('90d')")
        await page.waitForTimeout(1500)
        await expect(page.locator("button:has-text('90d')")).toBeVisible()
    })

    test("shows Order Status section", async ({ page }) => {
        await expect(page.locator("text=Order Status")).toBeVisible()
    })

    test("shows Top Products section", async ({ page }) => {
        await expect(page.locator("text=Top Products")).toBeVisible()
    })

    test("shows Recent Orders section", async ({ page }) => {
        await expect(page.locator("text=Recent Orders")).toBeVisible()
    })

    test("stat card values are numbers not undefined", async ({ page }) => {
        const badValues = ["undefined", "NaN", "null"]
        for (const v of badValues) {
            const count = await page.locator(`text=${v}`).count()
            expect(count, `Found "${v}" on analytics page`).toBe(0)
        }
    })
})
