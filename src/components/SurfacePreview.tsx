import { useId, useMemo, useState } from 'react';
import { DEFAULT_EXAMPLE, evaluate, sectionLoss, step } from '../math/engine';
import { Arrow, number } from './shared';
import type { Snapshot } from '../math/engine';

export function SurfacePreview({ snapshot, interactive = true }: { snapshot?: Snapshot; interactive?: boolean }) {
  const inkId = useId();
  const [tilt, setTilt] = useState(0);
  const [after, setAfter] = useState(false);
  const initial = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
  const updated = step(DEFAULT_EXAMPLE, initial.weights);
  const current = snapshot ?? (after ? updated : initial);
  const lines = useMemo(() => {
    const project = (a: number, b: number) => {
      const loss = sectionLoss(DEFAULT_EXAMPLE, a, b, current.weights[2]);
      const u = (a - 0.4) * 850; const v = (b - 0.4) * 850;
      return [350 + u - v * 0.65 + tilt * v * 0.1, 320 + v * 0.35 + u * 0.22 - loss * 0.052];
    };
    return Array.from({ length: 46 }, (_, i) => Array.from({ length: 48 }, (_, j) => {
      const fixed = 0.14 + (i % 23) / 22 * 0.5; const moving = 0.14 + j / 47 * 0.5;
      return project(i < 23 ? fixed : moving, i < 23 ? moving : fixed).join(',');
    }).join(' '));
  }, [current.weights, tilt]);
  const marker = (() => {
    const u = (current.weights[0] - 0.4) * 850; const v = (current.weights[1] - 0.4) * 850;
    return [350 + u - v * 0.65 + tilt * v * 0.1, 320 + v * 0.35 + u * 0.22 - current.loss * 0.052];
  })();
  return <div className="surface-preview" onPointerMove={event => {
    if (event.pointerType === 'mouse' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTilt((event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth - 0.5);
  }} onPointerLeave={() => setTilt(0)}>
    <svg viewBox="0 0 700 480" role="img" aria-label={`Sección de la pérdida con w3 fijo en ${number(current.weights[2], 4)}. Un valle parabólico. Pérdida ${number(current.loss, 4)}.`}>
      <defs><linearGradient id={inkId} x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stopColor="#79dacc"/><stop offset="0.7" stopColor="#c5f86b"/><stop offset="1" stopColor="#5c7847"/></linearGradient></defs>
      <g className="preview-mesh">{lines.map((line, i) => <polyline key={i} points={line} stroke={`url(#${inkId})`} strokeWidth={i % 5 === 0 ? 1.15 : 0.65} opacity={i % 5 === 0 ? 0.8 : 0.42} fill="none"/>)}</g>
      <path d="M66 365L410 445 640 305M66 365V86" fill="none" stroke="var(--line-strong)"/>
      <text x="47" y="72" className="axis-text">L</text><text x="423" y="460" className="axis-text">w₁</text><text x="650" y="310" className="axis-text">w₂</text>
      <circle className="preview-point" cx={marker[0]} cy={marker[1]} r="7" fill="var(--green)" stroke="var(--bg)" strokeWidth="2"/>
      <path d={`M${marker[0] + 10} ${marker[1] - 8}l32 -42h110`} fill="none" stroke="var(--green)" opacity="0.7"/>
      <text x={marker[0] + 50} y={marker[1] - 62} className="axis-text green">L = {number(current.loss, 2)}</text>
      <text x="500" y="60" className="axis-text">L = ½(w · x − y)²</text>
    </svg>
    <div className="preview-controls"><span className="mono">w₃ fijo = {number(current.weights[2], 4)}</span>{interactive && <button type="button" className="text-button" onClick={() => setAfter(value => !value)}>{after ? 'Volver al inicio' : 'Observar un paso'} <Arrow/></button>}</div>
  </div>;
}
