import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:4321';
const OUT = '/tmp/vt';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', '/'],
  ['work', '/work'],
  ['about', '/about'],
  ['blog', '/blog'],
  ['resume', '/resume'],
  ['start', '/start'],
  ['casestudy', '/work/anchor'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb'],
});

async function capture(page, name, label, full) {
  // Scroll through to trigger every ScrollTrigger reveal, then back to top.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += Math.round(window.innerHeight * 0.6)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 3000)); // past the 2.6s reveal failsafe
  await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: full });
  console.log(`  ${name}-${label}.png`);
}

// Desktop full-page
const dp = await browser.newPage();
await dp.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
for (const [name, path] of pages) {
  await dp.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 30000 });
  await capture(dp, name, 'desktop', true);
}

// Mobile full-page (iPhone-ish)
const mp = await browser.newPage();
await mp.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
for (const [name, path] of pages) {
  await mp.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 30000 });
  await capture(mp, name, 'mobile', true);
}

// Mobile nav open (tap burger)
await mp.goto(BASE + '/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));
await mp.click('#nav-burger').catch(() => {});
await new Promise((r) => setTimeout(r, 600));
await mp.screenshot({ path: `${OUT}/home-mobile-navopen.png`, fullPage: false });
console.log('  home-mobile-navopen.png');

await browser.close();
console.log('DONE');
