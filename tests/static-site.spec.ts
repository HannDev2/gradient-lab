import { test, expect } from '@playwright/test';

test('rutas estáticas, recursos y consola funcionan en el sitio completo', async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
  if (test.info().project.name === 'mobile') await page.setViewportSize({ width: 320, height: 780 });
  for (const hash of ['', ...Array.from({ length: 7 }, (_, i) => `#/aprender/${i + 1}`), '#/laboratorio', '#/fundamentos']) {
    await page.goto(hash);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const cartel = page.getByRole('link', { name: 'Consultar cartel original' });
  const response = await page.request.get((await cartel.getAttribute('href'))!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  await page.getByRole('link', { name: 'Regla de la cadena', exact: true }).click();
  await expect(page).toHaveURL(/#\/fundamentos#concepto-4$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Regla de la cadena', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(badResponses).toEqual([]);
});
