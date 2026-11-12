import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('los pesos se leen con precisión contextual sin redondear el valor editable', async ({ page }) => {
  await page.goto('#/laboratorio');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
  const weight = page.getByLabel('Valor del peso 2', { exact: true });
  await weight.focus();
  await weight.blur();
  await expect(page.getByTestId('iteration')).toHaveText('1');
  await weight.fill('0.12345678912345678');
  await weight.press('Enter');
  await expect(weight).toHaveValue('0.123457');
  await weight.focus();
  await expect(weight).toHaveValue('0.12345678912345678');
  await weight.fill('0.7');
  await weight.press('Escape');
  await weight.blur();
  await weight.focus();
  await expect(weight).toHaveValue('0.12345678912345678');
});

test('las ayudas reservan espacio sin cubrir métricas, controles ni paisaje', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/laboratorio');
  for (const name of ['predicción', 'pérdida', 'error']) {
    await page.getByRole('button', { name: `Cómo se calcula la ${name}`.replace('la error', 'el error') }).click();
    const help = page.getByRole('tooltip');
    await expect(help).toBeVisible();
    await help.scrollIntoViewIfNeeded();
    const overlap = await help.evaluate(element => {
      const a = element.getBoundingClientRect();
      return [...document.querySelectorAll('.live-readouts output, .landscape-stage, .lab-toolbar, .lab-controls button, .training-plots')].some(other => {
        const b = other.getBoundingClientRect();
        return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      });
    });
    expect(overlap).toBe(false);
    await page.keyboard.press('Escape');
    await expect(help).toBeHidden();
  }
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('la demo del cartel es reproducible y conserva el laboratorio personalizado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/laboratorio');
  const weight = page.getByLabel('Valor del peso 1', { exact: true });
  await weight.fill('0.4'); await weight.press('Enter');
  await page.getByText('Editar entradas y objetivo', { exact: true }).click();
  const input = page.getByLabel('Entrada 1', { exact: true });
  await input.fill('200'); await input.press('Enter');
  const rate = page.getByLabel('Tasa de aprendizaje exacta', { exact: true });
  await rate.fill('0.00004'); await rate.press('Enter');
  await page.goto('#/presentacion');
  await page.clock.install();
  for (let repeat = 0; repeat < 2; repeat++) {
    await page.getByRole('button', { name: 'Iniciar demostración del cartel' }).click();
    await expect(page.getByTestId('demo-mode')).toContainText('cartel');
    await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
    await expect(page.getByTestId('cinema-prediction')).toHaveText('99.00');
    await expect(page.getByTestId('demo-parameters')).toContainText('0.00001');
    await page.getByRole('button', { name: 'Reproducir presentación' }).click();
    await page.clock.fastForward(2450);
    await expect(page.getByTestId('cinema-prediction')).toHaveText('112.14');
    await expect(page.getByTestId('cinema-loss')).toHaveText('261.2898');
    await page.getByRole('button', { name: 'Pausar presentación' }).click();
    await page.getByRole('button', { name: 'Reproducir presentación' }).click();
    await page.clock.fastForward(4900);
    await expect(page.getByTestId('cinema-prediction')).toHaveText('112.14');
    await page.getByRole('button', { name: 'Escena 1: La entrada' }).click();
  }
  await page.getByRole('button', { name: 'Restaurar presentación' }).click();
  await expect(page.getByTestId('cinema-progress')).toHaveText('1 / 10');
  await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
  await expect(page.getByTestId('cinema-prediction')).toHaveText('99.00');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'GRADIENT LAB', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explorar laboratorio', exact: true }).click();
  await expect(page.getByTestId('prediction')).toHaveText('149.00');
  await expect(rate).toHaveValue('0.00004');
  await expect(weight).toHaveValue('0.4');
});

test('la demo divergente muestra el crecimiento real y una conclusión identificada', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/presentacion');
  await page.clock.install();
  await page.getByRole('button', { name: 'Iniciar demostración divergente' }).click();
  await expect(page.getByTestId('demo-parameters')).toContainText('Caso del cartel · η = 0.00001');
  await page.getByRole('button', { name: 'Escena 9: Entrenamiento en vivo' }).click();
  await expect(page.getByTestId('demo-mode')).toContainText('divergente');
  await expect(page.getByTestId('demo-parameters')).toContainText('0.00008');
  await page.getByRole('button', { name: 'Reproducir presentación' }).click();
  await page.clock.fastForward(2450);
  await expect(page.getByTestId('cinema-loss')).toHaveText('2388.7872');
  await page.clock.runFor(4900);
  await expect(page.getByTestId('cinema-loss')).toHaveText((648 * 1.92 ** 6).toFixed(4));
  await page.getByRole('button', { name: 'Escena 10: Lo que aprendimos' }).click();
  await expect(page.locator('.cinema-conclusion')).toContainText('más pérdida');
  await expect(page.getByTestId('demo-mode')).toContainText('divergente');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('el renderizado software limita su framebuffer en pantallas de alta densidad', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto('');
  const canvas = page.locator('.hero-landscape canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('.scene-placeholder')).toHaveCount(0);
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width / element.clientWidth)).toBeLessThanOrEqual(1.01);
  await context.close();
});

test('el hero separa el título y las etiquetas en tablet y escritorio', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('');
    await expect(page.locator('.hero-landscape canvas')).toBeVisible();
    const overlap = await page.locator('.hero-editorial h1').evaluate(title => {
      const a = title.getBoundingClientRect();
      return [...document.querySelectorAll('.hero-landscape .landscape-constraint, .hero-landscape .coordinate-key')].some(label => {
        const b = label.getBoundingClientRect();
        return Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
      });
    });
    expect(overlap, `etiquetas a ${width}px`).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});
