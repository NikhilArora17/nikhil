import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/nik.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

// Kill GSAP, force everything visible, scroll to about
await page.evaluate(() => {
  document.querySelectorAll('.rv').forEach(el => el.classList.add('vis'));
  const ai = document.querySelector('.about-inner');
  if (ai) { ai.style.cssText += 'opacity:1!important;transform:none!important;'; }
  // Hide sticker overlay so about content is visible
  const ss = document.querySelector('.sticker-seq');
  if (ss) ss.style.display = 'none';
  document.querySelector('#about .about-inner').scrollIntoView();
});
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: 'temporary screenshots/about-view.png' });

await browser.close();
console.log('done');
