const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');

const OUT_PNG = path.join(__dirname, '../public/portfolio/retrohouse-preview.png');
const OUT_WEBP = path.join(__dirname, '../public/portfolio/retrohouse-preview.webp');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      'rh-consent',
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        categories: {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
        },
      }),
    );
  });

  await page.goto('https://sklep-retrohouse.pl', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT_PNG, type: 'png' });
  await browser.close();

  execSync(
    `python "${path.join(__dirname, 'convert-portfolio-preview.py')}" "${OUT_PNG}" "${OUT_WEBP}"`,
    { stdio: 'inherit' },
  );
})();
