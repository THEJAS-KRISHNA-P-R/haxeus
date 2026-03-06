import { test, expect } from "@playwright/test"

const uid = () => Date.now().toString().slice(-6)

test.describe("Coupons CRUD", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("/admin/coupons")
        await expect(page.locator("h1:has-text('Coupons')")).toBeVisible({ timeout: 10_000 })
    })

    test("coupons page loads with table", async ({ page }) => {
        await expect(page.locator("text=COUPON CODE")).toBeVisible()
        await expect(page.locator("text=DISCOUNT")).toBeVisible()
        await expect(page.locator("text=STATUS")).toBeVisible()
        await expect(page.locator("text=USAGE")).toBeVisible()
    })

    test("CREATE — opens modal and creates percentage coupon", async ({ page }) => {
        const code = `TEST${uid()}`

        await page.click("button:has-text('CREATE COUPON')")
        await expect(page.locator("text=Create Coupon")).toBeVisible({ timeout: 5_000 })

        await page.fill('input[placeholder="SAVE20"]', code)
        await page.selectOption('select', "percentage")

        await page.click("button:has-text('Create Coupon'):not([disabled])")
        await expect(page.locator("text=Create Coupon")).not.toBeVisible({ timeout: 8_000 })
        await expect(page.locator(`text=${code}`)).toBeVisible({ timeout: 8_000 })
    })

    test("CREATE — creates fixed amount coupon", async ({ page }) => {
        const code = `FLAT${uid()}`

        await page.click("button:has-text('CREATE COUPON')")
        await page.fill('input[placeholder="SAVE20"]', code)
        await page.selectOption('select', "fixed")

        await page.click("button:has-text('Create Coupon'):not([disabled])")
        await expect(page.locator("text=Create Coupon")).not.toBeVisible({ timeout: 8_000 })
        await expect(page.locator(`text=${code}`)).toBeVisible({ timeout: 8_000 })
    })

    test("DELETE — removes coupon with confirmation", async ({ page }) => {
        const code = `DEL${uid()}`
        await page.click("button:has-text('CREATE COUPON')")
        await page.fill('input[placeholder="SAVE20"]', code)
        await page.click("button:has-text('Create Coupon'):not([disabled])")
        await expect(page.locator(`text=${code}`)).toBeVisible({ timeout: 8_000 })

        // Click trash icon in that row
        const row = page.locator(`div:has-text("${code}")`).last()
        await row.locator('button').last().click()

        // Confirmation buttons — click check
        await page.locator('button').filter({ has: page.locator('svg') }).nth(-2).click()

        await expect(page.locator(`text=${code}`)).not.toBeVisible({ timeout: 8_000 })
    })

    test("VALIDATION — empty code shows error", async ({ page }) => {
        await page.click("button:has-text('CREATE COUPON')")
        await page.click("button:has-text('Create Coupon'):not([disabled])")
        await expect(page.locator("text=Coupon code is required")).toBeVisible({ timeout: 5_000 })
    })

    test("PERSISTENCE — coupon survives page reload", async ({ page }) => {
        const code = `PRST${uid()}`
        await page.click("button:has-text('CREATE COUPON')")
        await page.fill('input[placeholder="SAVE20"]', code)
        await page.click("button:has-text('Create Coupon'):not([disabled])")
        await expect(page.locator(`text=${code}`)).toBeVisible({ timeout: 8_000 })

        await page.reload()
        await expect(page.locator(`text=${code}`)).toBeVisible({ timeout: 10_000 })
    })
})
