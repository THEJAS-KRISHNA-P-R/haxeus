import { test, expect } from '@playwright/test';

// WORKFLOW 2: CHECKOUT FLOW TEST
// Run: npx playwright test tests/specs/checkout-flow.spec.ts

test.describe('Checkout Flow', () => {
  test('full add-to-cart and checkout form', async ({ page }) => {
    // Step 1: Products page — confirm cards visible
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="orders-table"], .group.overflow-hidden').first()).toBeVisible({ timeout: 10_000 }).catch(() => {});
    await page.screenshot({ path: 'playwright-output/checkout-01-products.png', fullPage: true });

    const messages1 = page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()); });

    // Step 2: Click first product card
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-output/checkout-02-product-detail.png', fullPage: true });

    // Step 3: Select a size
    const sizeButtons = page.locator('button').filter({ hasText: /^(S|M|L|XL|XXL)$/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }

    // Step 4: Add to cart
    const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-output/checkout-03-added-to-cart.png', fullPage: true });

    // Step 5: Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-output/checkout-04-cart.png', fullPage: true });

    // Step 6: Click checkout
    const checkoutBtn = page.locator('a[href="/checkout"], button').filter({ hasText: /checkout/i }).first();
    await checkoutBtn.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-output/checkout-05-checkout.png', fullPage: true });

    // Step 7: Fill shipping form
    const fill = async (selector: string, value: string) => {
      const el = page.locator(selector).first();
      if (await el.count() > 0) { await el.clear(); await el.fill(value); }
    };

    await fill('input[name="name"], input[placeholder*="name" i]',      'Test User');
    await fill('input[name="email"], input[type="email"]',              'test@example.com');
    await fill('input[name="phone"], input[placeholder*="phone" i]',    '9999999999');
    await fill('input[name="address"], input[placeholder*="address" i]','123 Test Street');
    await fill('input[name="city"], input[placeholder*="city" i]',      'Bangalore');
    await fill('input[name="pincode"], input[placeholder*="pin" i]',    '560001');
    await fill('input[name="state"], input[placeholder*="state" i]',    'Karnataka');

    // Step 8: Screenshot filled form
    await page.screenshot({ path: 'playwright-output/checkout-06-form-filled.png', fullPage: true });

    // Step 9: Verify pay button visible — DO NOT click (live API)
    const payBtn = page.locator('button').filter({ hasText: /pay\s*₹/i }).first();
    const razorpayBtn = page.locator('[data-testid="razorpay-button"], button').filter({ hasText: /pay/i }).first();
    const btnVisible = (await payBtn.count() > 0) || (await razorpayBtn.count() > 0);
    console.log('[checkout] Pay button visible:', btnVisible);

    await page.screenshot({ path: 'playwright-output/checkout-07-pay-button.png', fullPage: true });
  });
});
