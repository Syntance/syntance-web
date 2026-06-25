const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');

const OUT_PNG = path.join(__dirname, '../public/portfolio/lumine-concept-preview.png');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      'lumine.consent.v1',
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        updatedAt: Date.now(),
        version: 1,
      }),
    );
  });

  await page.goto('https://lumineconcept.pl', { waitUntil: 'networkidle' });

  // Baner popup pojawia się po 2s — ładuj hero wcześniej, zanim modal zasłoni widok.
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT_PNG, type: 'png' });
  await browser.close();

  execSync(
    `python "${path.join(__dirname, 'convert-portfolio-preview.py')}" "${OUT_PNG}" "${path.join(__dirname, '../public/portfolio/lumine-concept-preview.webp')}"`,
    { stdio: 'inherit' },
  );
})();
