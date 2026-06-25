const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const OUT_PNG = path.join(__dirname, '../public/portfolio/lumine-concept-preview.png');
const OUT_WEBP = path.join(__dirname, '../public/portfolio/lumine-concept-preview.webp');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  await page.goto('https://lumineconcept.pl', { waitUntil: 'networkidle' });

  for (const label of ['Akceptuj wszystko', 'Tylko niezbędne', 'Odrzuć wszystko']) {
    const btn = page.getByRole('button', { name: label });
    if (await btn.count()) {
      await btn.first().click();
      await page.waitForTimeout(500);
      break;
    }
  }

  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT_PNG, type: 'png' });
  await browser.close();

  const py = `from PIL import Image; im=Image.open(r"${OUT_PNG.replace(/\\/g, '/')}"); im.resize((1200,630), Image.Resampling.LANCZOS).save(r"${OUT_WEBP.replace(/\\/g, '/')}", format='WEBP', quality=92, method=6)`;
  execSync(`python -c "${py}"`, { stdio: 'inherit' });
  fs.unlinkSync(OUT_PNG);
  console.log('saved', OUT_WEBP);
})();
