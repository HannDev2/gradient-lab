import { DEFAULT_EXAMPLE, evaluate, stability, step, vector } from '../math/engine';
import type { Example, Snapshot, Vec3 } from '../math/engine';

export interface Simulation {
  config: Example;
  history: readonly Snapshot[];
  playing: boolean;
  message: string;
}
export type Preset = 'slow' | 'stable' | 'divergent';
export type Action =
  | { type: 'step'; count: number }
  | { type: 'weight'; index: number; value: number }
  | { type: 'eta'; value: number }
  | { type: 'data'; inputs: Vec3; target: number }
  | { type: 'play'; value: boolean }
  | { type: 'preset'; preset: Preset }
  | { type: 'reset' };

export function createSimulation(): Simulation {
  const config = { inputs: DEFAULT_EXAMPLE.inputs, target: DEFAULT_EXAMPLE.target, eta: DEFAULT_EXAMPLE.eta };
  return { config, history: [evaluate(config, DEFAULT_EXAMPLE.weights)], playing: false, message: 'Ejemplo original. Modifica un peso o ejecuta el primer paso.' };
}

function stopReason(state: Simulation): string | null {
  const current = state.history[state.history.length - 1];
  if (state.history.length >= 1001) return 'Límite de 1000 pasos alcanzado. Restablece el ejemplo para continuar.';
  if (state.config.eta === 0) return 'Con η = 0 los pesos no cambian. Introduce una tasa positiva.';
  if (current.gradient.every(value => Math.abs(value) < 1e-8)) return 'Gradiente prácticamente nulo: no hay más ajuste para este caso.';
  if (current.loss > 1e16) return 'Límite de pérdida alcanzado por divergencia. Reduce η o restablece el ejemplo.';
  return null;
}

export function simulationReducer(state: Simulation, action: Action): Simulation {
  try {
    const current = state.history[state.history.length - 1];
    switch (action.type) {
      case 'reset': return createSimulation();
      case 'preset': {
        const original = createSimulation();
        const rates = { slow: 0.000001, stable: 0.00001, divergent: 0.00008 };
        return { ...original, config: { ...original.config, eta: rates[action.preset] }, message: 'Escenario cargado desde los pesos originales. Compara cómo evoluciona la pérdida.' };
      }
      case 'weight': {
        if (!Number.isInteger(action.index) || action.index < 0 || action.index > 2) throw new RangeError('Elige uno de los tres pesos.');
        const weights = [...current.weights]; weights[action.index] = action.value;
        return { ...state, history: [evaluate(state.config, weights)], playing: false, message: 'Peso actualizado. Comienza una nueva trayectoria desde este estado.' };
      }
      case 'eta': {
        stability(state.config.inputs, action.value);
        return { ...state, config: { ...state.config, eta: action.value }, playing: false, message: 'Tasa actualizada. El historial anterior se conserva; el siguiente paso usa la nueva η.' };
      }
      case 'data': {
        const config = { ...state.config, inputs: vector(action.inputs), target: action.target };
        stability(config.inputs, config.eta);
        return { ...state, config, history: [evaluate(config, current.weights)], playing: false, message: 'Datos actualizados. Se recalcularon la jacobiana, el gradiente y el paisaje.' };
      }
      case 'play': {
        const reason = action.value ? stopReason(state) : null;
        return { ...state, playing: action.value && !reason, message: reason ?? (action.value ? 'Entrenamiento en curso: un paso cada 650 ms.' : 'Entrenamiento en pausa. Puedes inspeccionar cada instrumento.') };
      }
      case 'step': {
        if (!Number.isInteger(action.count) || action.count < 1 || action.count > 1000) throw new RangeError('Usa entre 1 y 1000 pasos enteros.');
        const history = [...state.history];
        for (let i = 0; i < action.count; i++) {
          const reason = stopReason({ ...state, history });
          if (reason) return { ...state, history, playing: false, message: reason };
          try {
            history.push(step(state.config, history[history.length - 1].weights));
          } catch (error) {
            return { ...state, history, playing: false, message: error instanceof Error ? error.message : 'No se pudo calcular el paso. Reduce los valores.' };
          }
        }
        return { ...state, history, message: `${history.length - 1} ${history.length === 2 ? 'paso calculado' : 'pasos calculados'}. Todos los pesos usan el mismo gradiente en cada iteración.` };
      }
    }
  } catch (error) {
    return { ...state, playing: false, message: error instanceof Error ? error.message : 'Revisa los valores del experimento.' };
  }
}
