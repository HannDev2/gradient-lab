import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('el foco de ruta respeta un control que el usuario ya seleccionó', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T18:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-10T18:00:01Z'));
  await page.goto('#/aprender/1');
  const reveal = page.getByRole('button', { name: 'Revelar objetivo' });
  await reveal.focus();
  await page.clock.runFor(100);
  await expect(reveal).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('revealed-target')).toHaveText('135');
});

test('la ayuda de métricas abre con teclado o toque y cierra con Escape', async ({ page }) => {
  await page.goto('#/laboratorio');
  const help = page.getByRole('button', { name: 'Cómo se calcula la pérdida' });
  await help.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tooltip')).toContainText('L = ½e²');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toBeHidden();
  await help.click();
  await expect(page.getByRole('tooltip')).toContainText('USD²');
});

test('la entrada conserva el paisaje SVG hasta el primer fotograma WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const samples: boolean[] = [];
    let draws = 0;
    for (const name of ['drawArrays', 'drawElements'] as const) {
      const original = WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name] = function (...args: number[]) {
        draws++;
        return Reflect.apply(original, this, args);
      };
    }
    new MutationObserver(() => {
      const scene = document.querySelector('.hero-landscape [data-testid="landscape-3d"]');
      if (scene?.querySelector('canvas') && !draws) samples.push(!!scene.querySelector('.surface-preview svg'));
    }).observe(document, { childList: true, subtree: true });
    Object.assign(window, { entrySamples: samples });
  });
  await page.goto('');
  await page.getByRole('button', { name: 'Ver en 3D', exact: true }).click();
  await expect(page.getByTestId('landscape-3d')).toBeVisible();
  await expect(page.locator('.scene-placeholder')).toHaveCount(0);
  const samples = await page.evaluate(() => (window as unknown as { entrySamples: boolean[] }).entrySamples);
  expect(samples.length).toBeGreaterThan(0);
  expect(samples.every(Boolean)).toBe(true);
});

test('las diez escenas conservan navegación y contenido en el ancho disponible', async ({ page }) => {
  await page.goto('#/presentacion');
  const buttons = page.locator('.cinema-timeline button');
  await expect(buttons).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    await buttons.nth(i).click();
    await expect(page.getByTestId('cinema-progress')).toHaveText(`${i + 1} / 10`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('presentación cinematográfica recorre el proyecto con control y cálculo real', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: 'Iniciar presentación cinematográfica' }).click();
  await expect(page.getByTestId('cinema-progress')).toHaveText('1 / 10');
  await expect(page.getByRole('button', { name: 'Reproducir presentación' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('cinema-progress')).toHaveText('2 / 10');
  await page.getByRole('button', { name: 'Revelar objetivo', exact: true }).click();
  await expect(page.getByTestId('revealed-target')).toHaveText('135');
  await page.getByRole('button', { name: 'Escena 6: El descenso' }).click();
  await page.getByRole('button', { name: 'Actualizar los tres pesos' }).click();
  await expect(page.getByTestId('updated-weights')).toContainText('0.3396');
  await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
  await page.getByRole('button', { name: 'Calcular un paso en presentación' }).click();
  await expect(page.getByTestId('cinema-prediction')).toHaveText('112.14');
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await expect(page.getByRole('button', { name: 'Pausar presentación' })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar presentación' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'GRADIENT LAB', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explorar laboratorio' }).click();
  await expect(page.getByTestId('prediction')).toHaveText('112.14');
});

test('presentación cinematográfica mantiene teclado, alternativa y acceso reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('#/presentacion');
  await expect(page.getByRole('main')).toHaveClass(/cinema/);
  await page.getByRole('button', { name: 'Escena 5: La jacobiana' }).click();
  await page.getByRole('button', { name: 'Construir jacobiana' }).click();
  await expect(page.getByTestId('jacobian-built')).toContainText('120');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
  await expect(page.getByTestId('landscape-2d')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole('button', { name: 'Restaurar presentación' }).click();
  await expect(page.getByTestId('cinema-progress')).toHaveText('1 / 10');
});

test('la secuencia automática avanza, pausa y se detiene al perder foco', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/presentacion');
  await page.getByRole('button', { name: 'Ver en 2D' }).click();
  await page.clock.install();
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await page.clock.fastForward(16100);
  await expect(page.getByTestId('cinema-progress')).toHaveText('2 / 10');
  await page.getByRole('button', { name: 'Pausar presentación' }).click();
  await page.clock.fastForward(20000);
  await expect(page.getByTestId('cinema-progress')).toHaveText('2 / 10');
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('button', { name: 'Reproducir presentación' })).toBeVisible();
  await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await page.clock.fastForward(2450);
  await expect(page.getByTestId('cinema-prediction')).toHaveText('112.14');
  await page.getByRole('button', { name: 'Pausar presentación' }).click();
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await expect(page.getByTestId('cinema-prediction')).toHaveText('112.14');
});

test('ascenso automático conserva el mismo snapshot en pesos y paisaje', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/presentacion');
  await page.getByRole('button', { name: 'Escena 6: El descenso' }).click();
  await page.getByRole('button', { name: 'Ascender', exact: true }).click();
  await page.clock.install();
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await page.clock.runFor(4900);
  await expect(page.getByTestId('updated-weights')).toContainText('0.2568');
  await expect(page.locator('.landscape-constraint strong')).toHaveText('0.2568');
});

test('las cifras animadas mantienen valores exactos del mismo estado', async ({ page }) => {
  await page.goto('#/laboratorio');
  const snapshots = await page.locator('.live-readouts').evaluate(root => new Promise<string[][]>(resolve => {
    const values: string[][] = [];
    const read = () => values.push(['prediction', 'loss', 'iteration'].map(id => root.querySelector(`[data-testid="${id}"]`)!.textContent!));
    const observer = new MutationObserver(read); observer.observe(root, { subtree: true, childList: true, characterData: true });
    (document.querySelector('[aria-label="Ejecutar un paso"]') as HTMLButtonElement).click();
    setTimeout(() => { read(); observer.disconnect(); resolve(values); }, 550);
  }));
  expect(snapshots.length).toBeGreaterThan(0);
  for (const snapshot of snapshots) expect(snapshot).toEqual(['112.14', '261.2898', '1']);
});
