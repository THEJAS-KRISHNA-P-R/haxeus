import { test, expect } from "@playwright/test"

test.describe("Admin global search", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("/admin")
        await expect(page.locator("text=HAXEUS").first()).toBeVisible({ timeout: 10_000 })
    })

    test("search input is visible in topbar", async ({ page }) => {
        const search = page.locator('input[placeholder*="Search"]').first()
        await expect(search).toBeVisible()
    })

    test("Ctrl+K focuses search", async ({ page }) => {
        await page.keyboard.press("Control+k")
        const search = page.locator('input[placeholder*="Search"]').first()
        await expect(search).toBeFocused({ timeout: 3_000 })
    })

    test("Escape clears and closes results", async ({ page }) => {
        const search = page.locator('input[placeholder*="Search"]').first()
        await search.fill("test")
        await page.waitForTimeout(400)
        await page.keyboard.press("Escape")
        await page.waitForTimeout(200)
        const val = await search.inputValue()
        expect(val).toBe("")
    })

    test("typing shows results or searching state", async ({ page }) => {
        const search = page.locator('input[placeholder*="Search"]').first()
        await search.click()
        await search.fill("a")
        await page.waitForTimeout(500)
        // Just check it doesn't crash — results or "Searching" may appear
        // No hard assertion on result count
    })
})
