import { test, expect } from "@playwright/test"

test.describe("Admin dashboard", () => {

    test("loads overview page", async ({ page }) => {
        await page.goto("/admin")
        await expect(page).toHaveURL(/\/admin/)
        await expect(page.locator("text=HAXEUS").first()).toBeVisible({ timeout: 10_000 })
        await expect(page.locator("text=Overview")).toBeVisible()
        await expect(page.locator("text=Orders")).toBeVisible()
        await expect(page.locator("text=Products")).toBeVisible()
    })

    test("sidebar navigation works", async ({ page }) => {
        await page.goto("/admin")

        await page.click("text=Orders")
        await expect(page).toHaveURL(/\/admin\/orders/)

        await page.click("text=Products")
        await expect(page).toHaveURL(/\/admin\/products/)

        await page.click("text=Analytics")
        await expect(page).toHaveURL(/\/admin\/analytics/)

        await page.click("text=Settings")
        await expect(page).toHaveURL(/\/admin\/settings/)
    })

    test("admin user info shown in sidebar", async ({ page }) => {
        await page.goto("/admin")
        await expect(page.locator("text=Admin").first()).toBeVisible({ timeout: 10_000 })
    })

    test("theme toggle is visible and clickable", async ({ page }) => {
        await page.goto("/admin")
        const toggle = page.locator('button[aria-label="Toggle theme"]')
        await expect(toggle).toBeVisible({ timeout: 10_000 })
        const htmlTheme = await page.getAttribute("html", "data-theme")
        await toggle.click()
        await page.waitForTimeout(400)
        const newTheme = await page.getAttribute("html", "data-theme")
        expect(newTheme).not.toBe(htmlTheme)
        await toggle.click()
        await page.waitForTimeout(400)
        const restoredTheme = await page.getAttribute("html", "data-theme")
        expect(restoredTheme).toBe(htmlTheme)
    })

    test("theme persists across page reload", async ({ page }) => {
        await page.goto("/admin")
        const toggle = page.locator('button[aria-label="Toggle theme"]')
        await toggle.click()
        await page.waitForTimeout(400)
        const themeAfterToggle = await page.getAttribute("html", "data-theme")

        await page.reload()
        await page.waitForTimeout(500)
        const themeAfterReload = await page.getAttribute("html", "data-theme")
        expect(themeAfterReload).toBe(themeAfterToggle)
    })
})
