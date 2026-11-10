import { describe, expect, it } from 'vitest';
import { DEFAULT_EXAMPLE, evaluate, gradient, jacobian, predict, signedError, squaredLoss, stability, step, train, sectionLoss, projectHistory } from './engine';

describe('el ejemplo completo del cartel', () => {
  it('calcula predicción, error, pérdida, jacobiana y gradiente', () => {
    const { inputs, weights, target } = DEFAULT_EXAMPLE;
    expect(predict(inputs, weights)).toBeCloseTo(99, 12);
    expect(signedError(99, target)).toBe(-36);
    expect(squaredLoss(99, target)).toBe(648);
    expect(jacobian(inputs)).toEqual([[100, 110, 120]]);
    expect(gradient(inputs, weights, target)).toEqual([-3600, -3960, -4320]);
    expect(evaluate(DEFAULT_EXAMPLE, weights).contributions).toEqual([30, 33, 36]);
  });
  it('actualiza simultáneamente los tres pesos y reproduce todos los resultados', () => {
    const initial = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
    const after = step(DEFAULT_EXAMPLE, initial.weights);
    [0.336, 0.3396, 0.3432].forEach((v, i) => expect(after.weights[i]).toBeCloseTo(v, 12));
    expect(after.prediction).toBeCloseTo(112.14, 10);
    expect(after.error).toBeCloseTo(-22.86, 10);
    expect(after.loss).toBeCloseTo(261.2898, 9);
    expect(100 * (1 - after.loss / initial.loss)).toBeCloseTo(59.6775, 8);
  });
  it('coincide con diferencias finitas, no solo con el caso tabulado', () => {
    const example = { inputs: [2, -3, 7] as const, target: 4, eta: 0.001 };
    const weights = [0.8, -0.4, 0.7] as const;
    const g = gradient(example.inputs, weights, example.target);
    for (let i = 0; i < 3; i++) {
      const plus = [...weights]; const minus = [...weights];
      plus[i] += 1e-6; minus[i] -= 1e-6;
      const numeric = (squaredLoss(predict(example.inputs, plus), example.target) - squaredLoss(predict(example.inputs, minus), example.target)) / 2e-6;
      expect(g[i]).toBeCloseTo(numeric, 6);
    }
  });
});

describe('entrenamiento y estabilidad', () => {
  it('eta cero conserva los pesos', () => {
    expect(step({ ...DEFAULT_EXAMPLE, eta: 0 }, DEFAULT_EXAMPLE.weights).weights).toEqual(DEFAULT_EXAMPLE.weights);
  });
  it('gradiente cero conserva la solución', () => {
    expect(step({ ...DEFAULT_EXAMPLE, target: 99 }, DEFAULT_EXAMPLE.weights).prediction).toBe(99);
  });
  it('entradas nulas tienen gradiente cero aunque el objetivo sea distinto', () => {
    expect(gradient([0, 0, 0], [1, 2, 3], 5)).toEqual([-0, -0, -0]);
    expect(stability([0, 0, 0], 0.1).kind).toBe('flat');
  });
  it('clasifica tasa lenta, estable, oscilante y divergente', () => {
    expect(stability(DEFAULT_EXAMPLE.inputs, 1e-6).kind).toBe('slow');
    expect(stability(DEFAULT_EXAMPLE.inputs, 1e-5).kind).toBe('stable');
    expect(stability(DEFAULT_EXAMPLE.inputs, 4e-5).kind).toBe('oscillating');
    expect(stability(DEFAULT_EXAMPLE.inputs, 2 / 36500).kind).toBe('boundary');
    expect(stability(DEFAULT_EXAMPLE.inputs, 8e-5).kind).toBe('divergent');
    expect(stability(DEFAULT_EXAMPLE.inputs, 0).kind).toBe('paused');
  });
  it('satisface la recurrencia exacta del residuo', () => {
    const points = train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 6);
    points.slice(1).forEach((point, i) => expect(point.error).toBeCloseTo(points[i].error * (1 - 0.00001 * 36500), 10));
  });
  it('muestra crecimiento real de pérdida con tasa divergente', () => {
    const history = train({ ...DEFAULT_EXAMPLE, eta: 0.00008 }, DEFAULT_EXAMPLE.weights, 8);
    expect(history.at(-1)!.loss).toBeGreaterThan(history[0].loss * 1000);
  });
  it('la frontera alterna error sin reducir su magnitud', () => {
    const history = train({ ...DEFAULT_EXAMPLE, eta: 2 / 36500 }, DEFAULT_EXAMPLE.weights, 4);
    expect(history[1].error).toBeCloseTo(36, 10);
    history.forEach(p => expect(p.loss).toBeCloseTo(648, 8));
  });
  it('es reproducible y no modifica argumentos', () => {
    const before = JSON.stringify(DEFAULT_EXAMPLE);
    expect(train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 10)).toEqual(train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 10));
    expect(JSON.stringify(DEFAULT_EXAMPLE)).toBe(before);
  });
});

describe('fronteras y sección del paisaje', () => {
  it.each([NaN, Infinity, -Infinity])('rechaza números no finitos: %s', bad => {
    expect(() => predict([bad, 1, 2], [1, 2, 3])).toThrow();
    expect(() => squaredLoss(1, bad)).toThrow();
    expect(() => step({ ...DEFAULT_EXAMPLE, eta: bad }, DEFAULT_EXAMPLE.weights)).toThrow();
  });
  it('rechaza dimensiones, tasas negativas y cantidad inválida de iteraciones', () => {
    expect(() => predict([1, 2], [1, 2, 3])).toThrow();
    expect(() => gradient([1, 2, 3], [1, 2], 3)).toThrow();
    expect(() => step({ ...DEFAULT_EXAMPLE, eta: -1 }, DEFAULT_EXAMPLE.weights)).toThrow();
    for (const n of [-1, 0.5, NaN, 10001]) expect(() => train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, n)).toThrow();
  });
  it('rechaza overflow incluso cuando los argumentos eran finitos', () => {
    expect(() => predict([1e308, 1, 1], [1e308, 1, 1])).toThrow();
    expect(() => squaredLoss(1e308, 0)).toThrow();
  });
  it('la sección reproduce la pérdida actual y tiene una dirección plana', () => {
    const p = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
    expect(sectionLoss(DEFAULT_EXAMPLE, 0.3, 0.3, 0.3)).toBeCloseTo(p.loss, 10);
    expect(sectionLoss(DEFAULT_EXAMPLE, 0.41, 0.2, 0.3)).toBeCloseTo(p.loss, 10);
  });
  it('proyecta recalculando L para el w3 actual, sin cambiar el historial real', () => {
    const history = train(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights, 2);
    const snapshot = JSON.stringify(history);
    const currentW3 = history.at(-1)!.weights[2];
    const projected = projectHistory(DEFAULT_EXAMPLE, history, currentW3);
    expect(projected[0].loss).toBeCloseTo(sectionLoss(DEFAULT_EXAMPLE, 0.3, 0.3, currentW3), 10);
    expect(projected[0].loss).not.toBe(history[0].loss);
    expect(projected.at(-1)!.loss).toBeCloseTo(history.at(-1)!.loss, 10);
    expect(JSON.stringify(history)).toBe(snapshot);
  });
});
