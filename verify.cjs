const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "playwright-output/audit/VERIFY-mobile-home.png" });
  const btn = await page.$('button[aria-label="Menu"]');
  if (btn) { await btn.click(); await page.waitForTimeout(900); }
  await page.screenshot({ path: "playwright-output/audit/VERIFY-mobile-menu-open.png" });
  await browser.close();
  console.log("DONE");
})().catch(e => { console.error(e.message); process.exit(1); });
