import { test, expect } from "@playwright/test"

test.describe("Dark / Light theme switching", () => {

    test("dark theme is default when no preference stored", async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: undefined })
        const page = await ctx.newPage()

        await page.emulateMedia({ colorScheme: "dark" })
        await page.goto("/")
        await page.waitForTimeout(500)

        const theme = await page.getAttribute("html", "data-theme")
        expect(theme).toBe("dark")
        await ctx.close()
    })

    test("respects system light preference on first visit", async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: undefined })
        const page = await ctx.newPage()
        await page.emulateMedia({ colorScheme: "light" })
        await page.goto("/")
        await page.waitForTimeout(500)

        const theme = await page.getAttribute("html", "data-theme")
        expect(theme).toBe("light")
        await ctx.close()
    })

    test("toggle switches theme on admin page", async ({ page }) => {
        await page.goto("/admin")
        const toggle = page.locator('button[aria-label="Toggle theme"]')
        await expect(toggle).toBeVisible({ timeout: 10_000 })

        const before = await page.getAttribute("html", "data-theme")
        await toggle.click()
        await page.waitForTimeout(400)
        const after = await page.getAttribute("html", "data-theme")
        expect(after).not.toBe(before)
    })

    test("theme persists after navigation between admin pages", async ({ page }) => {
        await page.goto("/admin")
        const toggle = page.locator('button[aria-label="Toggle theme"]')

        await toggle.click()
        await page.waitForTimeout(400)
        const theme = await page.getAttribute("html", "data-theme")

        await page.click("text=Orders")
        await page.waitForURL(/\/admin\/orders/)
        await page.waitForTimeout(300)

        const themeAfterNav = await page.getAttribute("html", "data-theme")
        expect(themeAfterNav).toBe(theme)
    })

    test("no white flash — data-theme set synchronously before DOMContentLoaded", async ({ page }) => {
        await page.addInitScript(() => {
            document.addEventListener("DOMContentLoaded", () => {
                (window as any).__themeAtDCL = document.documentElement.getAttribute("data-theme")
            })
        })

        await page.goto("/admin")
        await page.waitForTimeout(500)

        const themeAtDCL = await page.evaluate(() => (window as any).__themeAtDCL)
        expect(themeAtDCL).not.toBeNull()
        expect(themeAtDCL).toMatch(/dark|light/)
    })
})
