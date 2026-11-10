import { expect, it } from 'vitest';
import { makeContours, makeLandscape } from './geometry';
import { DEFAULT_EXAMPLE, train, sectionLoss } from '../math/engine';

it('cada vértice y punto proyectado pertenece a la sección declarada', () => {
  const history = train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 5);
  const landscape = makeLandscape(DEFAULT_EXAMPLE, history);
  const current = history.at(-1)!;
  for (const [w1, loss, w2] of landscape.samples) expect(loss).toBeCloseTo(sectionLoss(DEFAULT_EXAMPLE, w1, w2, current.weights[2]), 9);
  expect(landscape.path.at(-1)![1]).toBeCloseTo(current.loss / landscape.maxLoss * 3.4, 9);
  expect(landscape.fixedW3).toBe(current.weights[2]);
  expect(landscape.positions.every(Number.isFinite)).toBe(true);
});

it('la sección degenerada de entradas cero conserva coordenadas finitas', () => {
  const example = { inputs: [0, 0, 0] as const, target: 4, eta: 0.01 };
  const history = train(example, [0.3, 0.3, 0.3], 0);
  const landscape = makeLandscape(example, history);
  expect(landscape.positions.every(Number.isFinite)).toBe(true);
  expect(new Set(landscape.samples.map(p => p[1])).size).toBe(1);
});

it('las curvas de nivel no desbordan con sensibilidades subnormales', () => {
  const example = { inputs: [1e-320, 0, 120] as const, target: 135, eta: 0.00001 };
  const history = train(example, [0.3, 0.3, 0.3], 0);
  expect(makeContours(example, history[0], 0.18)).toEqual([]);
});

it('cada segmento de nivel intersecta el dominio y conserva su pérdida', () => {
  const current = train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 0)[0];
  const lines = makeContours(DEFAULT_EXAMPLE, current, 0.18);
  expect(lines.some(line => line.residual === 0)).toBe(true);
  for (const line of lines) {
    for (const [u, v] of line.points) {
      expect(Number.isFinite(u) && Number.isFinite(v)).toBe(true);
      expect(Math.abs(u)).toBeLessThanOrEqual(1.0000001);
      expect(Math.abs(v)).toBeLessThanOrEqual(1.0000001);
      expect(sectionLoss(DEFAULT_EXAMPLE, 0.3 + u * 0.18, 0.3 + v * 0.18, 0.3)).toBeCloseTo(0.5 * line.residual ** 2, 7);
    }
  }
});

it('los vértices intermedios de la trayectoria visible se evalúan sobre la parábola', () => {
  const history = train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 2);
  const data = makeLandscape(DEFAULT_EXAMPLE, history);
  expect(data.path.length).toBeGreaterThan(history.length);
  for (const [u, height, v] of data.path) {
    const w1 = (data.bounds.min1 + data.bounds.max1) / 2 + u * data.span / 3;
    const w2 = (data.bounds.min2 + data.bounds.max2) / 2 + v * data.span / 3;
    expect(height * data.maxLoss / 3.4).toBeCloseTo(sectionLoss(DEFAULT_EXAMPLE, w1, w2, data.fixedW3), 8);
  }
});
