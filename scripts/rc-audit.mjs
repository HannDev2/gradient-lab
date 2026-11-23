import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Usa before o after.');
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4175/gradient-lab/';
const output = `docs/visual-v3/rc/${phase}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: existsSync('/opt/google/chrome/chrome') ? '/opt/google/chrome/chrome' : undefined, args: ['--no-sandbox'] });
const measurements = [];
try {
  for (const width of [768, 1440, 1440, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__entry = { frames: [], longTasks: [], draws: 0 };
      let previous;
      const frame = now => {
        if (previous !== undefined) window.__entry.frames.push(now - previous);
        previous = now;
        if (now < 5000) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      new PerformanceObserver(list => window.__entry.longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: true });
      for (const name of ['drawArrays', 'drawElements']) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) { window.__entry.draws++; return Reflect.apply(original, this, args); };
      }
    });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.waitForTimeout(5500);
    const sample = await page.evaluate(() => {
      const gl = document.querySelector('canvas')?.getContext('webgl2');
      const info = gl?.getExtension('WEBGL_debug_renderer_info');
      const frames = window.__entry.frames.sort((a, b) => a - b);
      return { renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown', framebuffer: gl ? [gl.drawingBufferWidth, gl.drawingBufferHeight] : null,
        fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        frames: { samples: frames.length, medianMs: frames[Math.floor(frames.length / 2)], p95Ms: frames[Math.floor(frames.length * .95)], over33ms: frames.filter(t => t > 33.34).length },
        longTasksMs: window.__entry.longTasks, draws: window.__entry.draws, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    if (sample.overflow || errors.length || !sample.framebuffer) throw new Error(JSON.stringify({ width, sample, errors }));
    const start = await page.evaluate(() => window.__entry.draws);
    await page.waitForTimeout(500);
    sample.idleDraws = await page.evaluate(start => window.__entry.draws - start, start);
    measurements.push({ width, deviceScaleFactor: 2, ...sample });
    if (measurements.filter(m => m.width === width).length === 1) await page.screenshot({ path: `${output}/hero-${width}.png`, scale: 'css' });
    await context.close();
  }
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
    const page = await context.newPage();
    await page.goto(`${base}#/laboratorio`);
    await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
    await page.getByRole('button', { name: 'Cómo se calcula la pérdida' }).click();
    await page.screenshot({ path: `${output}/help-${width}.png`, fullPage: true });
    if (phase === 'after') {
      await page.goto(`${base}#/presentacion`);
      await page.getByRole('button', { name: 'Iniciar demostración del cartel' }).waitFor();
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${output}/cinema-start-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Iniciar demostración del cartel' }).click();
      await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
      await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${output}/demo-stable-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Escena 1: La entrada' }).click();
      await page.getByRole('button', { name: 'Iniciar demostración divergente' }).click();
      await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
      await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click();
      for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${output}/demo-divergent-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Escena 10: Lo que aprendimos' }).click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${output}/demo-result-${width}.png`, fullPage: true });
    }
    await context.close();
  }
  await writeFile(`${output}/performance.json`, JSON.stringify({ phase, date: new Date().toISOString(), measurements, scope: 'Chromium; renderer explícito; 5 s de entrada a DPR de dispositivo 2. Cadencia rAF, no FPS de GPU. Tres cargas 1440 y una por cada otro ancho; no es benchmark de hardware físico.' }, null, 2) + '\n');
  console.log(JSON.stringify(measurements));
} finally { await browser.close(); }
