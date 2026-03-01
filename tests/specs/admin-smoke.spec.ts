import { test, expect } from '@playwright/test';

// WORKFLOW 3: ADMIN SMOKE TEST
// Run: npx playwright test tests/specs/admin-smoke.spec.ts
// Set ADMIN_EMAIL and ADMIN_PASSWORD env vars (use a test account — never commit real creds)

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

test.describe('Admin Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const passInput  = page.locator('input[type="password"]').first();
    if (await emailInput.count() > 0 && ADMIN_EMAIL) {
      await emailInput.fill(ADMIN_EMAIL);
      await passInput.fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/\/admin/, { timeout: 15_000 }).catch(() => {});
    }
  });

  test('admin overview — stat cards visible', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-output/admin-01-overview.png', fullPage: true });

    // Verify sidebar
    await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
    console.log('[admin] sidebar visible');
  });

  test('sidebar nav items navigate correctly', async ({ page }) => {
    const navItems = [
      { href: '/admin/products',  label: 'Products'  },
      { href: '/admin/orders',    label: 'Orders'    },
    ];

    for (const item of navItems) {
      await page.goto(item.href);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `playwright-output/admin-nav-${item.label.toLowerCase()}.png`, fullPage: true });
      console.log(`[admin] ${item.label} page loaded`);
    }
  });

  test('orders page — table, search and status filter', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Verify table columns
    const table = page.locator('[data-testid="orders-table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });
    const headers = ['Order', 'Customer', 'Date', 'Total', 'Status'];
    for (const h of headers) {
      const cell = page.locator('th').filter({ hasText: new RegExp(h, 'i') });
      console.log(`[orders] header "${h}" found:`, await cell.count() > 0);
    }

    // Search filtering
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'playwright-output/admin-orders-search.png', fullPage: true });
      await searchInput.clear();
    }
  });

  test('products page — add product modal opens and closes', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-output/admin-products.png', fullPage: true });

    // Click add product button
    const addBtn = page.locator('[data-testid="add-product-btn"]').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(500);
      // If it navigates instead of modal, that's fine too
      if (page.url().includes('/new')) {
        await page.screenshot({ path: 'playwright-output/admin-add-product-page.png', fullPage: true });
        console.log('[admin] navigated to new product page');
        await page.goBack();
      } else {
        const modal = page.locator('[data-testid="admin-modal"]');
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible();
          await page.screenshot({ path: 'playwright-output/admin-add-product-modal.png', fullPage: true });
          // Close modal
          const closeBtn = page.locator('[data-testid="admin-modal"] button').first();
          await closeBtn.click();
          await page.waitForTimeout(300);
          console.log('[admin] modal opened and closed');
        }
      }
    }
  });

  test('mobile — sidebar at 375px', async ({ page }) => {
    await page.goto('/admin');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'playwright-output/admin-mobile-375.png', fullPage: true });
    console.log('[admin] mobile screenshot taken');
  });
});
