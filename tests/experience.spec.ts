import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('entrada, siete capítulos y navegación reversible', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('');
  await expect(page.getByRole('heading', { name: 'GRADIENT LAB', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('inicio.png'), fullPage: true });
  await page.getByRole('link', { name: 'Comenzar experimento' }).click();
  for (let chapter = 1; chapter <= 7; chapter++) {
    await expect(page.getByTestId('chapter-progress')).toHaveText(`${chapter} / 7`);
    await page.screenshot({ path: testInfo.outputPath(`capitulo-${chapter}.png`), fullPage: true });
    if (chapter === 1) {
      await page.getByRole('button', { name: 'Revelar objetivo' }).click();
      await expect(page.getByTestId('revealed-target')).toHaveText('135');
    }
    if (chapter === 2) {
      await page.getByRole('button', { name: 'Inspeccionar peso 2' }).click();
      await expect(page.getByTestId('contribution-detail')).toContainText('33');
    }
    if (chapter === 4) {
      await page.getByRole('button', { name: 'Construir jacobiana' }).click();
      await expect(page.getByTestId('jacobian-built')).toContainText('120');
    }
    if (chapter === 5) {
      await page.getByRole('button', { name: 'Actualizar los tres pesos' }).click();
      await expect(page.getByTestId('updated-weights')).toContainText('0.3396');
    }
    if (chapter < 7) await page.getByRole('link', { name: 'Siguiente capítulo' }).click();
  }
  await page.getByRole('link', { name: 'Capítulo anterior' }).click();
  await expect(page.getByTestId('chapter-progress')).toHaveText('6 / 7');
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(page.getByTestId('chapter-progress')).toHaveText('1 / 7');
  expect(errors).toEqual([]);
});

test('laboratorio: cálculo real, pesos, tasa, lote, reproducción y reinicio', async ({ page }, testInfo) => {
  await page.goto('#/laboratorio');
  await expect(page.getByTestId('prediction')).toHaveText('99.00');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
  await expect(page.getByTestId('prediction')).toHaveText('112.14');
  await expect(page.getByTestId('loss')).toHaveText('261.2898');
  await expect(page.getByLabel('Valor del peso 2', { exact: true })).toHaveValue('0.3396');
  await page.getByLabel('Valor del peso 1', { exact: true }).focus();
  await page.getByRole('heading', { name: 'Tu laboratorio.' }).click();
  await expect(page.getByTestId('iteration')).toHaveText('1');
  await page.screenshot({ path: testInfo.outputPath('laboratorio.png'), fullPage: true });
  await page.getByRole('button', { name: 'Restablecer ejemplo' }).click();
  await page.getByLabel('Valor del peso 1', { exact: true }).fill('0.4');
  await page.getByLabel('Valor del peso 1', { exact: true }).press('Enter');
  await expect(page.getByTestId('prediction')).toHaveText('109.00');
  await page.getByRole('button', { name: 'Restablecer ejemplo' }).click();
  await page.getByRole('button', { name: 'Ejecutar lote' }).click();
  await expect(page.getByTestId('iteration')).toHaveText('10');
  await page.getByRole('button', { name: 'Reproducir entrenamiento' }).click();
  await expect(page.getByTestId('iteration')).not.toHaveText('10');
  await page.getByRole('button', { name: 'Pausar entrenamiento' }).click();
  const paused = await page.getByTestId('iteration').textContent();
  await page.waitForTimeout(800);
  await expect(page.getByTestId('iteration')).toHaveText(paused!);
  await page.getByRole('button', { name: 'Restablecer ejemplo' }).click();
  await expect(page.getByTestId('iteration')).toHaveText('0');
  await expect(page.getByTestId('prediction')).toHaveText('99.00');
});

test('divergencia, edición de datos y validación conservan estado válido', async ({ page }) => {
  await page.goto('#/laboratorio');
  await page.getByRole('button', { name: 'Divergente', exact: true }).click();
  await expect(page.getByTestId('stability')).toContainText('Divergente');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
  await expect(page.getByTestId('loss')).toHaveText('2388.7872');
  await page.getByRole('button', { name: 'Restablecer ejemplo' }).click();
  await page.getByLabel('Tasa de aprendizaje exacta', { exact: true }).fill('-1');
  await page.getByLabel('Tasa de aprendizaje exacta', { exact: true }).press('Enter');
  await expect(page.getByRole('alert')).toContainText('mayor o igual');
  await expect(page.getByTestId('prediction')).toHaveText('99.00');
  await page.getByLabel('Tasa de aprendizaje exacta', { exact: true }).fill('0.00001');
  await page.getByLabel('Tasa de aprendizaje exacta', { exact: true }).press('Enter');
  await page.getByText('Editar entradas y objetivo', { exact: true }).click();
  await page.getByLabel('Entrada 1', { exact: true }).fill('200');
  await page.getByLabel('Entrada 1', { exact: true }).press('Enter');
  await expect(page.getByTestId('prediction')).toHaveText('129.00');
  await expect(page.getByTestId('lab-jacobian')).toContainText('200');
});

test('alternativa 2D, teclado, accesibilidad y ausencia de desbordamiento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  for (const hash of ['', '#/aprender/4', '#/laboratorio', '#/fundamentos']) {
    await page.goto(hash);
    await expect(page.getByRole('main')).toBeVisible();
    if (hash === '#/laboratorio') await expect(page.getByTestId('landscape-2d')).toBeVisible();
    await page.keyboard.press('Tab');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }
});

test('escena WebGL real se monta y permite cambiar cámara y dimensión', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('#/laboratorio');
  await expect(page.getByTestId('landscape-3d')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Rotar cámara a la izquierda' }).click();
  await page.getByRole('button', { name: 'Acercar cámara' }).click();
  await page.getByRole('button', { name: 'Ver en 2D' }).click();
  await expect(page.getByTestId('landscape-2d')).toBeVisible();
  await page.getByRole('button', { name: 'Ver en 3D' }).click();
  await expect(page.getByTestId('landscape-3d')).toBeVisible();
  await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext());
  await expect(page.getByTestId('landscape-2d')).toBeVisible();
  expect(errors).toEqual([]);
});

test('el recorrido y los controles se operan con teclado', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: 'Comenzar experimento' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('chapter-progress')).toHaveText('1 / 7');
  await page.getByRole('button', { name: 'Revelar objetivo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('revealed-target')).toHaveText('135');
  await page.goto('#/laboratorio');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('prediction')).toHaveText('112.14');
  await page.getByLabel('Ajustar peso 1', { exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('prediction')).not.toHaveText('112.14');
});
