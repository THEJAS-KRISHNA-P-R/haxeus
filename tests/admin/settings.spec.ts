import { test, expect } from "@playwright/test"

test.describe("Settings page", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("/admin/settings")
        await expect(page.locator("h1:has-text('Settings')")).toBeVisible({ timeout: 15_000 })
    })

    test("loads all setting sections", async ({ page }) => {
        await expect(page.locator("text=Store Information")).toBeVisible()
        await expect(page.locator("text=Shipping")).toBeVisible()
        await expect(page.locator("text=Notifications")).toBeVisible()
        await expect(page.locator("text=Danger Zone")).toBeVisible()
    })

    test("has pre-filled values from DB", async ({ page }) => {
        const storeNameInput = page.locator('input').first()
        const val = await storeNameInput.inputValue()
        expect(val.length).toBeGreaterThan(0)
        expect(val).not.toBe("undefined")
    })

    test("SAVE — updates store name and persists", async ({ page }) => {
        const storeNameInput = page.locator('input').first()
        const original = await storeNameInput.inputValue()

        const newName = `HAXEUS Test ${Date.now().toString().slice(-4)}`
        await storeNameInput.fill(newName)

        await page.click("button:has-text('Save Changes')")
        await expect(page.locator("text=Saved!")).toBeVisible({ timeout: 8_000 })

        await page.reload()
        await page.waitForTimeout(2000)
        const reloadedVal = await page.locator('input').first().inputValue()
        expect(reloadedVal).toBe(newName)

        // Restore original
        await storeNameInput.fill(original)
        await page.click("button:has-text('Save Changes')")
        await expect(page.locator("text=Saved!")).toBeVisible({ timeout: 8_000 })
    })
})
