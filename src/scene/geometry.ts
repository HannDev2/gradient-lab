import { projectHistory, sectionLoss } from '../math/engine';
import type { Example, Snapshot } from '../math/engine';

export function makeContours(example: Example, current: Snapshot, span: number) {
  const [a, b] = example.inputs;
  const coefficientScale = Math.max(Math.abs(a), Math.abs(b));
  if (coefficientScale === 0) return [];
  const corners = [-1, 1].flatMap(u => [-1, 1].map(v => current.error + a * span * u + b * span * v));
  const min = Math.min(...corners); const max = Math.max(...corners);
  if (min === max) return [];
  const an = a / coefficientScale; const bn = b / coefficientScale;
  const levels = Array.from({ length: 21 }, (_, i) => min + (max - min) * i / 20);
  if (min <= 0 && max >= 0) levels.push(0);
  return levels.flatMap(residual => {
    const c = (residual - current.error) / coefficientScale / span;
    const intersections: [number, number][] = [];
    if (an !== 0) for (const v of [-1, 1]) intersections.push([(c - bn * v) / an, v]);
    if (bn !== 0) for (const u of [-1, 1]) intersections.push([u, (c - an * u) / bn]);
    const points = intersections.filter(([u, v], index, all) => Number.isFinite(u) && Number.isFinite(v) && Math.abs(u) <= 1 + 1e-10 && Math.abs(v) <= 1 + 1e-10 && !all.slice(0, index).some(([x, y]) => Math.abs(x - u) + Math.abs(y - v) < 1e-10));
    return points.length < 2 ? [] : [{ residual, points: points.slice(0, 2) }];
  });
}

export function makeLandscape(example: Example, history: readonly Snapshot[]) {
  const current = history[history.length - 1];
  const [w1, w2, fixedW3] = current.weights;
  const [a, b] = example.inputs;
  const normSquared = a * a + b * b;
  const valleyW1 = normSquared > 0 ? w1 - current.error * a / normSquared : w1;
  const valleyW2 = normSquared > 0 ? w2 - current.error * b / normSquared : w2;
  const ws1 = [...history.map(p => p.weights[0]), valleyW1];
  const ws2 = [...history.map(p => p.weights[1]), valleyW2];
  const center1 = (Math.min(...ws1) + Math.max(...ws1)) / 2;
  const center2 = (Math.min(...ws2) + Math.max(...ws2)) / 2;
  const span = Math.max(0.25, (Math.max(...ws1) - Math.min(...ws1)) * 0.7, (Math.max(...ws2) - Math.min(...ws2)) * 0.7);
  const bounds = { min1: center1 - span, max1: center1 + span, min2: center2 - span, max2: center2 + span };
  const maxLoss = Math.max(1, ...[bounds.min1, bounds.max1].flatMap(x => [bounds.min2, bounds.max2].map(y => sectionLoss(example, x, y, fixedW3))));
  const position = (x: number, loss: number, y: number): [number, number, number] => [(x - center1) / span * 3, loss / maxLoss * 3.4, (y - center2) / span * 3];
  const samples: [number, number, number][] = [];
  const positions: number[] = [];
  const indices: number[] = [];
  const size = 40;
  for (let row = 0; row <= size; row++) {
    for (let col = 0; col <= size; col++) {
      const x = bounds.min1 + col / size * span * 2;
      const y = bounds.min2 + row / size * span * 2;
      const loss = sectionLoss(example, x, y, fixedW3);
      samples.push([x, loss, y]); positions.push(...position(x, loss, y));
      if (row < size && col < size) {
        const i = row * (size + 1) + col;
        indices.push(i, i + size + 1, i + 1, i + 1, i + size + 1, i + size + 2);
      }
    }
  }
  const grid: number[] = [];
  for (let i = 0; i <= size; i += 2) {
    for (let j = 0; j < size; j++) {
      grid.push(...positions.slice((i * (size + 1) + j) * 3, (i * (size + 1) + j) * 3 + 3), ...positions.slice((i * (size + 1) + j + 1) * 3, (i * (size + 1) + j + 1) * 3 + 3));
      grid.push(...positions.slice((j * (size + 1) + i) * 3, (j * (size + 1) + i) * 3 + 3), ...positions.slice(((j + 1) * (size + 1) + i) * 3, ((j + 1) * (size + 1) + i) * 3 + 3));
    }
  }
  const path = projectHistory(example, history, fixedW3).map(p => position(p.w1, p.loss, p.w2));
  const marker = position(w1, current.loss, w2);
  return { samples, positions, indices, grid, path, marker, maxLoss, fixedW3, bounds, span };
}
