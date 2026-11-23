import { test, expect } from '@playwright/test';

test('portada viva: cinco momentos, una iteración y parámetros transferibles', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('[data-moment]')).toHaveCount(5);
  await page.getByRole('button', { name: 'Observar una iteración' }).click();
  await expect(page.getByTestId('hero-loss')).toHaveText('261.2898');
  await page.getByRole('button', { name: 'Destapar objetivo de la portada' }).click();
  await expect(page.getByTestId('home-target')).toHaveText('135');
  await page.getByRole('button', { name: 'Derivar', exact: true }).click();
  await expect(page.getByTestId('circuit-formula')).toContainText('3960');
  await page.getByRole('button', { name: 'Ascender por la pérdida' }).click();
  await expect(page.getByTestId('direction-loss')).toHaveText('1207.3698');
  await page.getByLabel('Probar peso uno en la portada').fill('0.4');
  await expect(page.getByTestId('home-preview-prediction')).toHaveText('109.00');
  await page.getByRole('link', { name: 'Continuar con estos pesos' }).click();
  await expect(page.getByTestId('prediction')).toHaveText('109.00');
});

test('presentación reutiliza capítulos, teclado y salida al modo normal', async ({ page }) => {
  await page.goto('#/aprender/1');
  await page.getByRole('button', { name: 'Modo presentación' }).click();
  await expect(page.getByRole('main')).toHaveClass(/presentation/);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('chapter-progress')).toHaveText('2 / 7');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('chapter-progress')).toHaveText('1 / 7');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('main')).not.toHaveClass(/presentation/);
});

test('el escenario oscilatorio alterna el error y reduce su magnitud', async ({ page }) => {
  await page.goto('#/laboratorio');
  await page.getByRole('button', { name: 'Oscilatorio', exact: true }).click();
  await expect(page.getByTestId('stability')).toHaveText('Oscilación estable');
  await expect(page.getByTestId('error-factor')).toHaveText('q = -0.460');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
  await expect(page.getByTestId('loss')).toHaveText('137.1168');
  await expect(page.getByTestId('prediction')).toHaveText('151.56');
  await page.getByRole('button', { name: 'Ejecutar un paso', exact: true }).click();
  await expect(page.getByTestId('prediction')).toHaveText('127.38');
});

test('la portada libera WebGL fuera de vista y respeta movimiento reducido', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: 'Ver en 3D' }).click();
  await expect(page.getByTestId('landscape-3d')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.locator('#tu-turno').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('landscape-3d')).toHaveCount(0);
  await expect(page.locator('.atmosphere')).toHaveAttribute('data-active', 'false');
  await page.locator('.living-hero').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('landscape-3d')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.atmosphere-sweep')).toHaveCSS('display', 'none');
});
