import { test } from '@playwright/test';
import * as fs from 'fs';

// UI Audit — takes full-page screenshots of every major route at desktop + mobile
// Run: npx playwright test tests/specs/ui-audit.spec.ts --project "Desktop Chrome"

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'testadmin@hax.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'testtest';

const OUT = 'playwright-output/audit';

test.describe('UI Audit', () => {
  test.setTimeout(120_000);

  // ── PUBLIC PAGES ────────────────────────────────────────────────────────────

  test('home page', async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/01-home.png`,         fullPage: true });
    // Scroll to each snap section
    for (let i = 1; i <= 4; i++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/01-home-section${i}.png`, fullPage: false });
    }
  });

  test('products listing', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/02-products.png`, fullPage: true });
  });

  test('product detail', async ({ page }) => {
    // Navigate to products first, then click the first one
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const firstProduct = page.locator('a[href^="/products/"]').first();
    if (await firstProduct.count() > 0) {
      const href = await firstProduct.getAttribute('href');
      await page.goto(href ?? '/products');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: `${OUT}/03-product-detail.png`, fullPage: true });
  });

  test('cart page', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/04-cart.png`, fullPage: true });
  });

  test('auth page', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/05-auth.png`, fullPage: true });
  });

  test('contact page', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/06-contact.png`, fullPage: true });
  });

  test('about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/07-about.png`, fullPage: true });
  });

  test('checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/08-checkout.png`, fullPage: true });
  });

  test('orders page (unauthenticated)', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/09-orders-unauth.png`, fullPage: true });
  });

  test('profile page (unauthenticated)', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/10-profile-unauth.png`, fullPage: true });
  });

  test('size guide page', async ({ page }) => {
    await page.goto('/size-guide');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/11-size-guide.png`, fullPage: true });
  });

  test('privacy policy page', async ({ page }) => {
    await page.goto('/privacy-policy');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/12-privacy-policy.png`, fullPage: true });
  });

  test('terms page', async ({ page }) => {
    await page.goto('/terms-conditions');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/13-terms.png`, fullPage: true });
  });

  test('returns page', async ({ page }) => {
    await page.goto('/returns-refunds');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/14-returns.png`, fullPage: true });
  });

  // ── MOBILE VIEWS ────────────────────────────────────────────────────────────

  test('home — mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/m-01-home.png`, fullPage: false });
  });

  test('products — mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/m-02-products.png`, fullPage: true });
  });

  test('navbar — mobile menu open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    // Open hamburger/mobile menu
    const menuBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], button[aria-label*="nav" i]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: `${OUT}/m-03-navbar-menu.png`, fullPage: false });
  });

  // ── ADMIN PAGES ─────────────────────────────────────────────────────────────

  test('admin — authenticated views', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 20_000 }).catch(() => {});

    const adminPages = [
      { path: '/admin',          name: 'a-01-admin-overview'  },
      { path: '/admin/products', name: 'a-02-admin-products'  },
      { path: '/admin/orders',   name: 'a-03-admin-orders'    },
      { path: '/admin/settings', name: 'a-04-admin-settings'  },
    ];

    for (const p of adminPages) {
      await page.goto(p.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
      console.log(`[audit] ${p.path} captured`);
    }
  });
});
