import { describe, expect, it } from 'vitest';
import { createSimulation, simulationReducer } from './simulation';

describe('un estado coherente para el laboratorio', () => {
  it('ejecuta un paso calculado y restablece el experimento completo', () => {
    const initial = createSimulation();
    const trained = simulationReducer(initial, { type: 'step', count: 1 });
    expect(trained.history).toHaveLength(2);
    expect(trained.history[1].prediction).toBeCloseTo(112.14, 10);
    expect(simulationReducer(trained, { type: 'reset' })).toEqual(initial);
  });
  it('lote y pasos individuales dan los mismos resultados', () => {
    const initial = createSimulation();
    const batch = simulationReducer(initial, { type: 'step', count: 10 });
    let individual = initial;
    for (let i = 0; i < 10; i++) individual = simulationReducer(individual, { type: 'step', count: 1 });
    expect(batch.history).toEqual(individual.history);
  });
  it('editar pesos pausa e inicia un historial nuevo', () => {
    let state = simulationReducer(createSimulation(), { type: 'step', count: 3 });
    state = simulationReducer(state, { type: 'play', value: true });
    state = simulationReducer(state, { type: 'weight', index: 1, value: 0.5 });
    expect(state.playing).toBe(false);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].weights[1]).toBe(0.5);
  });
  it('editar datos recalcula jacobiana, estado e historial', () => {
    const state = simulationReducer(createSimulation(), { type: 'data', inputs: [1, 2, 3], target: 6 });
    expect(state.history[0].prediction).toBeCloseTo(1.8, 10);
    expect(state.config.inputs).toEqual([1, 2, 3]);
    expect(state.history).toHaveLength(1);
  });
  it('eta conserva los resultados anteriores y pausa', () => {
    const before = simulationReducer(createSimulation(), { type: 'step', count: 4 });
    const after = simulationReducer(before, { type: 'eta', value: 0.00008 });
    expect(after.history).toBe(before.history);
    expect(after.config.eta).toBe(0.00008);
    expect(after.playing).toBe(false);
  });
  it('no almacena NaN, Infinity ni crecimiento extremo', () => {
    let state = simulationReducer(createSimulation(), { type: 'preset', preset: 'divergent' });
    state = simulationReducer(state, { type: 'step', count: 500 });
    expect(state.playing).toBe(false);
    expect(state.message).toMatch(/límite/i);
    expect(state.history.length).toBeLessThan(501);
    for (const point of state.history) expect(Number.isFinite(point.loss)).toBe(true);
  });
  it('rechaza entradas no finitas conservando el último historial válido', () => {
    const initial = createSimulation();
    for (const action of [
      { type: 'weight', index: 0, value: NaN } as const,
      { type: 'eta', value: -1 } as const,
      { type: 'data', inputs: [1, Infinity, 3], target: 1 } as const,
      { type: 'step', count: 0.5 } as const,
    ]) {
      const result = simulationReducer(initial, action);
      expect(result.history).toBe(initial.history);
      expect(result.message).toBeTruthy();
      expect(result.playing).toBe(false);
    }
  });
  it('detiene reproducción si no hay paso posible o ya convergió', () => {
    let state = simulationReducer(createSimulation(), { type: 'eta', value: 0 });
    expect(simulationReducer(state, { type: 'play', value: true }).playing).toBe(false);
    state = simulationReducer(createSimulation(), { type: 'data', inputs: [100, 110, 120], target: 99 });
    expect(simulationReducer(state, { type: 'play', value: true }).playing).toBe(false);
  });
  it('impone un límite total de historial y permite reiniciar', () => {
    const slow = simulationReducer(createSimulation(), { type: 'eta', value: 1e-10 });
    const full = simulationReducer(slow, { type: 'step', count: 1000 });
    const extra = simulationReducer(full, { type: 'step', count: 1 });
    expect(extra.history.length).toBe(1001);
    expect(extra.message).toMatch(/límite/i);
    expect(simulationReducer(extra, { type: 'reset' }).history).toHaveLength(1);
  });
});
