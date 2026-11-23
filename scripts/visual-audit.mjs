import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { existsSync } from 'node:fs';

const [phase, base = 'http://127.0.0.1:4173/gradient-lab/'] = process.argv.slice(2);
if (!['before', 'after'].includes(phase)) throw new Error('Usa before o after y la URL base.');
const output = `docs/visual-v2/${phase}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: existsSync('/opt/google/chrome/chrome') ? '/opt/google/chrome/chrome' : undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const measurements = [];
try {
  for (const width of [360, 390, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 1000 }, deviceScaleFactor: 1 });
    const start = Date.now();
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const performance = await page.evaluate(() => ({ fcp: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime, transferBytes: window.performance.getEntriesByType('resource').reduce((sum, r) => sum + r.transferSize, 0), overflow: document.documentElement.scrollWidth > innerWidth }));
    measurements.push({ width, ...performance, observedLoadMs: Date.now() - start });
    await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/hero-${width}.png` });
    if (phase === 'after' && width === 1440) {
      for (const id of ['reto', 'mecanismo', 'direccion', 'tu-turno']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        await page.locator(`#${id}`).screenshot({ path: `${output}/${id}.png` });
      }
    }
    if ([390, 1440].includes(width)) {
      for (const chapter of [2, 4, 5]) {
        await page.goto(`${base}#/aprender/${chapter}`);
        if (chapter === 4) await page.getByRole('button', { name: 'Construir jacobiana' }).click();
        if (chapter === 5) await page.getByRole('button', { name: 'Actualizar los tres pesos' }).click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${output}/chapter-${chapter}-${width}.png`, fullPage: true });
      }
      await page.goto(`${base}#/laboratorio`);
      await page.getByRole('button', { name: 'Ejecutar lote' }).click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${output}/lab-stable-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Lento', exact: true }).click();
      await page.getByRole('button', { name: 'Ejecutar lote' }).click();
      await page.screenshot({ path: `${output}/lab-slow-${width}.png`, fullPage: true });
      if (phase === 'after') {
        await page.getByRole('button', { name: 'Oscilatorio', exact: true }).click();
        await page.getByRole('button', { name: 'Ejecutar lote' }).click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${output}/lab-oscillating-${width}.png`, fullPage: true });
        await page.goto(`${base}#/aprender/4`);
        await page.getByRole('button', { name: 'Modo presentación' }).click();
        await page.getByRole('button', { name: 'Construir jacobiana' }).click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${output}/presentation-${width}.png`, fullPage: true });
        await page.goto(`${base}#/laboratorio`);
      }
      await page.getByRole('button', { name: 'Divergente', exact: true }).click();
      await page.getByRole('button', { name: 'Ejecutar lote' }).click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${output}/lab-divergent-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Ver en 2D' }).click();
      await page.screenshot({ path: `${output}/lab-2d-${width}.png`, fullPage: true });
    }
    await page.close();
  }
  const files = await readdir('dist/assets');
  const bundles = [];
  for (const file of files.filter(file => /\.(js|css)$/.test(file))) {
    const buffer = await readFile(`dist/assets/${file}`);
    bundles.push({ file, bytes: buffer.length, gzipBytes: gzipSync(buffer).length });
  }
  await writeFile(`${output}/performance.json`, JSON.stringify({ phase, base, date: new Date().toISOString(), measurements, bundles }, null, 2) + '\n');
  console.log(JSON.stringify({ phase, measurements, bundles }));
} finally { await browser.close(); }
