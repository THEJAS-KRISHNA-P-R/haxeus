import { test, expect } from "@playwright/test"

test.describe("Public homepage", () => {

    test("loads without errors", async ({ page }) => {
        const errors: string[] = []
        page.on("pageerror", e => errors.push(e.message))
        page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })

        await page.goto("/")
        await page.waitForTimeout(3000)

        const critical = errors.filter(e =>
            !e.includes("favicon") &&
            !e.includes("404") &&
            !e.includes("net::ERR")
        )
        expect(critical.length, `Console errors: ${critical.join(", ")}`).toBe(0)
    })

    test("hero section visible", async ({ page }) => {
        await page.goto("/")
        await expect(page.locator("text=Won't Change")).toBeVisible({ timeout: 10_000 })
    })

    test("navbar visible and contains HAXEUS", async ({ page }) => {
        await page.goto("/")
        await expect(page.locator("text=HAXEUS").first()).toBeVisible({ timeout: 10_000 })
    })

    test("Shop Collection button links to products", async ({ page }) => {
        await page.goto("/")
        await page.click("text=Shop Collection")
        await expect(page).toHaveURL(/\/products/)
    })

    test("LightPillar canvas renders", async ({ page }) => {
        await page.goto("/")
        await page.waitForTimeout(3000)
        const canvas = page.locator("canvas")
        await expect(canvas.first()).toBeAttached({ timeout: 10_000 })
        const box = await canvas.first().boundingBox()
        expect(box).not.toBeNull()
        expect(box!.width).toBeGreaterThan(100)
        expect(box!.height).toBeGreaterThan(100)
    })
})
