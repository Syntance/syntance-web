/**
 * Zrzuty panelu Magazyn + CMS do case study Lumine.
 *
 * Użycie (lokalnie lub na produkcji klienta):
 *   pnpm dev
 *   node scripts/capture-lumine-admin.cjs
 *   node scripts/capture-lumine-admin.cjs https://lumineconcept.pl
 *
 * Auth (env lub .env.local):
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Wynik: public/portfolio/lumine-concept/admin/*.png
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../public/portfolio/lumine-concept/admin');
const EMAIL = process.env.ADMIN_EMAIL?.trim();
const PASSWORD = process.env.ADMIN_PASSWORD?.trim();

const COOKIE_CONSENT = JSON.stringify({
  necessary: true,
  analytics: false,
  marketing: false,
});

const SHOTS = [
  { file: 'magazyn-przeglad.png', path: '/magazyn', waitMs: 800 },
  { file: 'magazyn-cennik.png', path: '/magazyn/cennik', waitMs: 1200 },
  {
    file: 'cms-sklepy.png',
    path: '/magazyn/cms',
    waitMs: 600,
    afterNavigate: async (page) => {
      await page.getByRole('button', { name: /sklepy internetowe/i }).click({ timeout: 8000 });
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'cms-portfolio.png',
    path: '/magazyn/cms',
    waitMs: 600,
    afterNavigate: async (page) => {
      await page.getByRole('button', { name: /^portfolio\b/i }).click({ timeout: 8000 });
      await page.waitForTimeout(500);
    },
  },
];

async function login(page) {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Ustaw ADMIN_EMAIL i ADMIN_PASSWORD w .env.local');
  }

  await page.goto(`${BASE_URL}/magazyn/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.getByRole('button', { name: /zaloguj|log in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.addInitScript((consent) => {
    localStorage.setItem('cookie-consent', consent);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  }, COOKIE_CONSENT);

  try {
    await login(page);

    for (const shot of SHOTS) {
      await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(shot.waitMs);
      if (shot.afterNavigate) await shot.afterNavigate(page);
      const outPath = path.join(OUT_DIR, shot.file);
      await page.screenshot({ path: outPath, type: 'png', fullPage: false });
      console.log('✓', shot.file);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nZapisano w ${OUT_DIR}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
