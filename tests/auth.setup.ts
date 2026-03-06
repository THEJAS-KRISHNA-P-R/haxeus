import { test as setup, expect } from "@playwright/test"
import path from "path"

const authFile = path.join(__dirname, ".auth/admin.json")

setup("authenticate as admin", async ({ page }) => {
    await page.goto("/auth")

    // Wait for the auth form to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 15_000 })

    // Fill credentials
    await page.fill('input[type="email"]', "testadmin@hax.in")
    await page.fill('input[type="password"]', "testtest")

    // Submit — try button first, fall back to Enter
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')
    if (await submitBtn.count() > 0) {
        await submitBtn.first().click()
    } else {
        await page.keyboard.press("Enter")
    }

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 20_000 })

    // Confirm we're actually on admin (not bounced back)
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator("text=HAXEUS").first()).toBeVisible({ timeout: 10_000 })

    // Save session state
    await page.context().storageState({ path: authFile })

    console.log("✓ Admin session saved")
})
