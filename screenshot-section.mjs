import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const selector = process.argv[3] || null; // e.g. '#work'

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const label = selector ? selector.replace('#','') : 'full';
const filepath = path.join(dir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

if (selector) {
  // Force all reveal elements visible so we can see them
  await page.evaluate(() => {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('vis'));
  });
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, selector);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: filepath });
} else {
  await page.screenshot({ path: filepath, fullPage: true });
}

await browser.close();
console.log(`Saved: ${filepath}`);
