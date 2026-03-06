import { test, expect } from "@playwright/test"

// These tests run WITHOUT stored auth state
test.use({ storageState: undefined })

test.describe("Admin route protection", () => {

    test("unauthenticated user is redirected from /admin", async ({ page }) => {
        // Clear any cookies
        await page.context().clearCookies()

        await page.goto("/admin")
        // Should end up on /auth or /?error=unauthorized
        await expect(page).not.toHaveURL(/\/admin(?!.*error)/, { timeout: 10_000 })
        await expect(page).toHaveURL(/\/auth|\/\?error/, { timeout: 10_000 })
    })

    test("unauthenticated user is redirected from /admin/orders", async ({ page }) => {
        await page.context().clearCookies()
        await page.goto("/admin/orders")
        await expect(page).not.toHaveURL("/admin/orders", { timeout: 10_000 })
    })

    test("unauthenticated user is redirected from /admin/products", async ({ page }) => {
        await page.context().clearCookies()
        await page.goto("/admin/products")
        await expect(page).not.toHaveURL("/admin/products", { timeout: 10_000 })
    })

    test("auth page loads correctly", async ({ page }) => {
        await page.goto("/auth")
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test("wrong password shows error", async ({ page }) => {
        await page.goto("/auth")
        await page.fill('input[type="email"]', "testadmin@hax.in")
        await page.fill('input[type="password"]', "wrongpassword")
        const btn = page.locator('button[type="submit"]').first()
        await btn.click()
        // Should NOT redirect to admin
        await page.waitForTimeout(3000)
        await expect(page).not.toHaveURL(/\/admin/)
    })
})
