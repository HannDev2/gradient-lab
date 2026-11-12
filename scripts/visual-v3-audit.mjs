import { chromium } from '@playwright/test';
import { mkdir, writeFile, readdir, readFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Usa before o after.');
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/gradient-lab/';
const output = `docs/visual-v3/${phase}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: existsSync('/opt/google/chrome/chrome') ? '/opt/google/chrome/chrome' : undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const measurements = [];
async function cadence(page) {
  return page.evaluate(() => new Promise(resolve => {
    const times = []; let previous; const start = performance.now();
    const frame = now => {
      if (previous !== undefined) times.push(now - previous);
      previous = now;
      if (now - start < 2200) requestAnimationFrame(frame);
      else {
        times.sort((a, b) => a - b);
        resolve({ samples: times.length, medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.floor(times.length * .95)], over33ms: times.filter(t => t > 33.34).length });
      }
    };
    requestAnimationFrame(frame);
  }));
}
try {
  for (const width of [360, 390, 768, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__drawCalls = 0;
      for (const name of ['drawArrays', 'drawElements']) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) { window.__drawCalls++; return original.apply(this, args); };
      }
    });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/hero-entry-${width}.png` });
    const motion = width === 1440 ? await cadence(page) : null;
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${output}/hero-${width}.png` });
    await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
    const perf = await page.evaluate(() => ({ fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, transferBytes: performance.getEntriesByType('resource').reduce((sum, r) => sum + r.transferSize, 0), overflow: document.documentElement.scrollWidth > innerWidth }));
    const idleStart = await page.evaluate(() => window.__drawCalls);
    await page.waitForTimeout(400);
    const idleDrawCalls = await page.evaluate(start => window.__drawCalls - start, idleStart);
    if (perf.overflow) throw new Error(`Overflow de portada a ${width}px`);
    let renderer = width <= 640 ? 'SVG' : 'No consultado';
    if (width === 1440) {
      renderer = await page.locator('canvas').evaluate(canvas => {
        const gl = canvas.getContext('webgl2'); const info = gl?.getExtension('WEBGL_debug_renderer_info');
        return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'WebGL sin identificación';
      });
    }
    measurements.push({ width, ...perf, cadence: motion, renderer, idleDrawCalls });
    if ([390, 1440].includes(width)) {
      await page.getByRole('button', { name: 'Observar una iteración' }).click();
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${output}/hero-step-${width}.png` });
      await page.locator('#mecanismo').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Derivar', exact: true }).click();
      await page.waitForTimeout(300);
      await page.locator('#mecanismo').screenshot({ path: `${output}/circuit-${width}.png` });
      await page.locator('#direccion').scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await page.locator('#direccion').screenshot({ path: `${output}/direction-${width}.png` });
      for (const scenario of ['Estable', 'Divergente']) {
        await page.goto(`${base}#/laboratorio`);
        await page.getByRole('button', { name: scenario, exact: true }).click();
        await page.getByRole('button', { name: 'Ejecutar lote' }).click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${output}/lab-${scenario}-${width}.png`, fullPage: true });
      }
      if (phase === 'after') {
        await page.getByRole('button', { name: 'Cómo se calcula la pérdida' }).click();
        await page.screenshot({ path: `${output}/lab-help-${width}.png` });
        await page.keyboard.press('Escape');
        await page.goto(`${base}#/presentacion`);
        await page.waitForTimeout(2800);
        await page.screenshot({ path: `${output}/cinema-intro-${width}.png` });
        await page.getByRole('button', { name: 'Escena 5: La jacobiana' }).click();
        await page.getByRole('button', { name: 'Construir jacobiana' }).click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${output}/cinema-jacobian-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: 'Escena 6: El descenso' }).click();
        await page.getByRole('button', { name: 'Actualizar los tres pesos' }).click();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${output}/cinema-descent-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
        await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click();
        await page.waitForTimeout(1300);
        await page.screenshot({ path: `${output}/cinema-live-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: 'Escena 10: Lo que aprendimos' }).click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${output}/cinema-end-${width}.png`, fullPage: true });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(base);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${output}/reduced-${width}.png`, fullPage: true });
      } else {
        await page.goto(`${base}#/aprender/4`);
        await page.getByRole('button', { name: 'Modo presentación' }).click();
        await page.getByRole('button', { name: 'Construir jacobiana' }).click();
        await page.screenshot({ path: `${output}/presentation-${width}.png`, fullPage: true });
      }
    }
    if (errors.length) throw new Error(JSON.stringify(errors));
    await context.close();
  }
  if (phase === 'after') {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: `${output}/video`, size: { width: 1440, height: 1000 } } });
    const page = await context.newPage();
    await page.goto(base); await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Observar una iteración' }).click(); await page.waitForTimeout(1400);
    await page.locator('#mecanismo').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Ajustar', exact: true }).click(); await page.waitForTimeout(1500);
    await page.goto(`${base}#/presentacion`); await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Escena 5: La jacobiana' }).click();
    await page.getByRole('button', { name: 'Construir jacobiana' }).click(); await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Escena 6: El descenso' }).click();
    await page.getByRole('button', { name: 'Actualizar los tres pesos' }).click(); await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
    await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click(); await page.waitForTimeout(1600);
    await page.getByRole('button', { name: 'Escena 10: Lo que aprendimos' }).click(); await page.waitForTimeout(1800);
    const video = page.video(); await context.close();
    await rename(await video.path(), `${output}/video/presentation.webm`);
  }
  const bundles = [];
  for (const file of (await readdir('dist/assets')).filter(f => /\.(js|css)$/.test(f))) {
    const buffer = await readFile(`dist/assets/${file}`);
    bundles.push({ file, bytes: buffer.length, gzipBytes: gzipSync(buffer).length });
  }
  const report = { phase, date: new Date().toISOString(), measurements, bundles, cadenceMeaning: 'Intervalos de requestAnimationFrame; no mide FPS efectivos de GPU. Renderer software, no extrapolar a hardware físico.' };
  await writeFile(`${output}/performance.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
