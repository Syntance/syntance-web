/**
 * Pełny zrzut strony głównej bez cookie bannera.
 *
 * Użycie:
 *   pnpm dev   (w osobnym terminalu)
 *   node scripts/capture-homepage.cjs
 *   node scripts/capture-homepage.cjs https://syntance.com
 *
 * Wynik: public/screenshots/homepage-full.png
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../public/screenshots');
const OUT_PNG = path.join(OUT_DIR, 'homepage-full.png');

const COOKIE_CONSENT = JSON.stringify({
  necessary: true,
  analytics: false,
  marketing: false,
});

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(window.innerHeight * 0.85, 400);
    let y = 0;
    const maxY = document.documentElement.scrollHeight;

    while (y < maxY) {
      window.scrollTo(0, y);
      await delay(180);
      y += step;
    }

    window.scrollTo(0, 0);
    await delay(300);
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Zgoda przed pierwszym skryptem strony — baner się nie pokaże.
  await page.addInitScript((consent) => {
    localStorage.setItem('cookie-consent', consent);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  }, COOKIE_CONSENT);

  console.log(`Ładowanie: ${BASE_URL}/`);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 120_000 });

  // Lazy sekcje / animacje scroll-in
  await scrollThrough(page);
  await page.waitForTimeout(800);

  await page.screenshot({
    path: OUT_PNG,
    type: 'png',
    fullPage: true,
  });

  await browser.close();

  console.log(`Zapisano: ${OUT_PNG}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
