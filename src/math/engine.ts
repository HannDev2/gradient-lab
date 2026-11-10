export type Vec3 = readonly [number, number, number];
export interface Example { inputs: Vec3; target: number; eta: number }
export interface Snapshot {
  weights: Vec3;
  contributions: Vec3;
  prediction: number;
  error: number;
  loss: number;
  gradient: Vec3;
}

export const DEFAULT_EXAMPLE = Object.freeze({
  inputs: Object.freeze([100, 110, 120]) as Vec3,
  weights: Object.freeze([0.3, 0.3, 0.3]) as Vec3,
  target: 135,
  eta: 0.00001,
});

function finite(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('El cálculo requiere números finitos. Reduce los valores e inténtalo de nuevo.');
  return value;
}

export function vector(values: readonly number[]): Vec3 {
  if (values.length !== 3) throw new RangeError('Se necesitan exactamente tres componentes.');
  return [finite(values[0]), finite(values[1]), finite(values[2])];
}

export function predict(inputs: readonly number[], weights: readonly number[]): number {
  const x = vector(inputs); const w = vector(weights);
  return finite(x.reduce((total, value, i) => total + value * w[i], 0));
}

export function signedError(prediction: number, target: number): number {
  return finite(finite(prediction) - finite(target));
}

export function squaredLoss(prediction: number, target: number): number {
  const error = signedError(prediction, target);
  return finite(0.5 * error * error);
}

export function jacobian(inputs: readonly number[]): readonly [Vec3] {
  return [vector(inputs)];
}

export function gradient(inputs: readonly number[], weights: readonly number[], target: number): Vec3 {
  const error = signedError(predict(inputs, weights), target);
  return vector(inputs.map(value => finite(error * value)));
}

export function evaluate(example: Pick<Example, 'inputs' | 'target'>, weights: readonly number[]): Snapshot {
  const w = vector(weights);
  const prediction = predict(example.inputs, w);
  return {
    weights: w,
    contributions: vector(example.inputs.map((value, i) => finite(value * w[i]))),
    prediction,
    error: signedError(prediction, example.target),
    loss: squaredLoss(prediction, example.target),
    gradient: gradient(example.inputs, w, example.target),
  };
}

export function step(example: Example, weights: readonly number[]): Snapshot {
  if (finite(example.eta) < 0) throw new RangeError('La tasa de aprendizaje debe ser mayor o igual a cero.');
  const w = vector(weights);
  const g = gradient(example.inputs, w, example.target);
  return evaluate(example, vector(w.map((value, i) => finite(value - example.eta * g[i]))));
}

export function train(example: Example, weights: readonly number[], iterations: number): Snapshot[] {
  if (!Number.isInteger(iterations) || iterations < 0 || iterations > 10000) throw new RangeError('Usa un número entero de pasos entre 0 y 10000.');
  const history = [evaluate(example, weights)];
  for (let i = 0; i < iterations; i++) history.push(step(example, history[history.length - 1].weights));
  return history;
}

export function stability(inputs: readonly number[], eta: number): { kind: 'flat' | 'paused' | 'boundary' | 'divergent' | 'oscillating' | 'slow' | 'stable'; normSquared: number; factor: number; limit: number | null } {
  if (finite(eta) < 0) throw new RangeError('La tasa no puede ser negativa.');
  const normSquared = finite(vector(inputs).reduce((sum, value) => sum + value * value, 0));
  const factor = finite(1 - eta * normSquared);
  const limit = normSquared === 0 ? null : finite(2 / normSquared);
  const kind = normSquared === 0 ? 'flat' : eta === 0 ? 'paused'
    : Math.abs(factor + 1) < 1e-12 ? 'boundary'
    : Math.abs(factor) > 1 ? 'divergent'
    : factor < 0 ? 'oscillating'
    : factor > 0.95 ? 'slow' : 'stable';
  return { kind, normSquared, factor, limit };
}

export function sectionLoss(example: Pick<Example, 'inputs' | 'target'>, w1: number, w2: number, fixedW3: number): number {
  return squaredLoss(predict(example.inputs, [w1, w2, fixedW3]), example.target);
}

export function projectHistory(example: Pick<Example, 'inputs' | 'target'>, history: readonly Snapshot[], fixedW3: number) {
  return history.map(point => ({
    w1: point.weights[0], w2: point.weights[1],
    loss: sectionLoss(example, point.weights[0], point.weights[1], fixedW3),
  }));
}
