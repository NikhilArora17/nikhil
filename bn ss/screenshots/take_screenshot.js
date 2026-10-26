const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file:///d:/Beenext website/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const hero = await page.$('#hero') || await page.$('.hero') || await page.$('section');
  if (hero) {
    await hero.screenshot({ path: 'd:/Beenext website/screenshots/hero_arc.png' });
  } else {
    await page.screenshot({ path: 'd:/Beenext website/screenshots/hero_arc.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  }
  await browser.close();
  console.log('Done');
})();
