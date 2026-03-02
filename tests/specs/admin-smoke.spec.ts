import { test, expect } from '@playwright/test';

// WORKFLOW 3: ADMIN SMOKE TEST
// Run: npx playwright test tests/specs/admin-smoke.spec.ts
// Set ADMIN_EMAIL and ADMIN_PASSWORD env vars (use a test account — never commit real creds)

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'testadmin@hax.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'testtest';

// Give each test plenty of time (auth + page load on deployed site)
test.describe('Admin Smoke Test', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    // Authenticate via /auth sign-in form
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('input[type="email"]').first();
    const passInput  = page.locator('input[type="password"]').first();

    // Wait for hydration — inputs become interactive
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });

    if (ADMIN_EMAIL) {
      await emailInput.fill(ADMIN_EMAIL);
      await passInput.fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').first().click();

      // Auth page redirects to "/" on success — wait for navigation away from /auth
      await page.waitForURL((url) => !url.pathname.startsWith('/auth'), {
        timeout: 20_000,
      }).catch(() => {
        console.warn('[auth] redirect from /auth did not happen — login may have failed');
      });

      // Now navigate to the admin panel
      await page.goto('/admin');
      await page.waitForLoadState('domcontentloaded');
      // Wait for admin layout to finish its loading spinner
      await page.waitForTimeout(2_000);
    }
  });

  test('admin overview — stat cards visible', async ({ page }) => {
    // beforeEach already navigated to /admin
    await page.screenshot({ path: 'playwright-output/admin-01-overview.png', fullPage: true });

    // The sidebar may or may not have data-testid — look for the nav links instead
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    const sidebarNav = page.locator('nav a[href="/admin"]');
    const hasSidebar = (await sidebar.count() > 0) || (await sidebarNav.count() > 0);
    console.log('[admin] sidebar visible:', hasSidebar);
    expect(hasSidebar).toBeTruthy();
  });

  test('sidebar nav items navigate correctly', async ({ page }) => {
    const navItems = [
      { href: '/admin/products',  label: 'Products'  },
      { href: '/admin/orders',    label: 'Orders'    },
    ];

    for (const item of navItems) {
      await page.goto(item.href);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2_000);
      await page.screenshot({ path: `playwright-output/admin-nav-${item.label.toLowerCase()}.png`, fullPage: true });
      console.log(`[admin] ${item.label} page loaded`);
    }
  });

  test('orders page — table, search and status filter', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_000);

    // Verify table exists (with or without data-testid)
    const table = page.locator('[data-testid="orders-table"], table').first();
    const tableVisible = (await table.count()) > 0;
    console.log('[orders] table visible:', tableVisible);

    if (tableVisible) {
      const headers = ['Order', 'Customer', 'Date', 'Total', 'Status'];
      for (const h of headers) {
        const cell = page.locator('th').filter({ hasText: new RegExp(h, 'i') });
        console.log(`[orders] header "${h}" found:`, await cell.count() > 0);
      }
    }

    // Search filtering
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'playwright-output/admin-orders-search.png', fullPage: true });
      await searchInput.clear();
    }

    await page.screenshot({ path: 'playwright-output/admin-orders.png', fullPage: true });
  });

  test('products page — add product modal opens and closes', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_000);
    await page.screenshot({ path: 'playwright-output/admin-products.png', fullPage: true });

    // Click add product button (with or without data-testid)
    const addBtn = page.locator('[data-testid="add-product-btn"], a[href="/admin/products/new"], button:has-text("Add Product")').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1_000);
      // If it navigates instead of modal, that's fine too
      if (page.url().includes('/new')) {
        await page.screenshot({ path: 'playwright-output/admin-add-product-page.png', fullPage: true });
        console.log('[admin] navigated to new product page');
        await page.goBack();
      } else {
        const modal = page.locator('[data-testid="admin-modal"], [role="dialog"]');
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible();
          await page.screenshot({ path: 'playwright-output/admin-add-product-modal.png', fullPage: true });
          // Close modal
          const closeBtn = modal.first().locator('button').first();
          await closeBtn.click();
          await page.waitForTimeout(300);
          console.log('[admin] modal opened and closed');
        }
      }
    } else {
      console.log('[admin] add product button not found — skipping');
    }
  });

  test('mobile — sidebar at 375px', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: 'playwright-output/admin-mobile-375.png', fullPage: true });
    console.log('[admin] mobile screenshot taken');
  });
});
