// Playwright visual check script
import { chromium } from 'playwright';
import fs from 'fs';

const dir = 'temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
// Let fonts + images load
await page.waitForTimeout(2000);

// Force all scroll-reveal elements visible so full-page looks correct
await page.evaluate(() => {
  document.querySelectorAll('.rv').forEach(el => el.classList.add('vis'));
});
await page.waitForTimeout(600);

// Full page
await page.screenshot({ path: `${dir}/pw-full.png`, fullPage: true });
console.log('✓ Full page saved');

// Viewport shots of each section
for (const [id, label] of [['#home','hero'], ['#work','work'], ['#about','about'], ['#contact','contact']]) {
  const el = await page.$(id);
  if (el) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${dir}/pw-${label}.png` });
    console.log(`✓ ${label} saved`);
  }
}

await browser.close();
console.log('\nAll screenshots saved to: temporary screenshots/');
