import { useId } from 'react';
import type { Example, Snapshot } from '../math/engine';
import { number } from './shared';
import { makeContours } from '../scene/geometry';

export function PricePlot({ snapshot, revealed = true, compact = false }: { snapshot: Snapshot; revealed?: boolean; compact?: boolean }) {
  const values = [100, 110, 120];
  const y = (v: number) => 310 - (v - 80) * 3.6;
  return <svg className={`price-plot ${compact ? 'compact-plot' : ''}`} viewBox="0 0 600 370" role="img" aria-label={`Precios hipotéticos de los días uno a tres: 100, 110 y 120 USD. Predicción del día cuatro: ${number(snapshot.prediction)} USD.${revealed ? ' Objetivo: 135 USD.' : ' El objetivo está oculto.'}`}>
    {[90, 110, 130, 150].map(v => <g key={v}><line x1="55" x2="555" y1={y(v)} y2={y(v)} className="plot-grid"/><text x="14" y={y(v) + 5} className="axis-text">{v}</text></g>)}
    <text x="14" y="24" className="axis-text">USD</text>
    <polyline points={values.map((v, i) => `${90 + i * 130},${y(v)}`).join(' ')} fill="none" stroke="var(--cyan)" strokeWidth="2.5"/>
    {values.map((v, i) => <g key={v}><circle cx={90 + i * 130} cy={y(v)} r="5" fill="var(--cyan)"/><text x={90 + i * 130} y={y(v) - 20} textAnchor="middle" className="plot-value">{v}</text><text x={90 + i * 130} y="344" textAnchor="middle" className="axis-text">Día {i + 1}</text></g>)}
    <line x1="350" y1={y(120)} x2="480" y2={y(snapshot.prediction)} stroke="var(--coral)" strokeWidth="2" strokeDasharray="5 5"/>
    <circle cx="480" cy={y(snapshot.prediction)} r="6" fill="var(--coral)"/>
    <text x="461" y={y(snapshot.prediction) + 24} textAnchor="end" className="plot-value coral">{number(snapshot.prediction)}</text>
    <text x="480" y="344" textAnchor="middle" className="axis-text">Día 4</text>
    {revealed ? <g><line x1="480" x2="480" y1={y(snapshot.prediction)} y2={y(135)} stroke="var(--green)" strokeDasharray="3 5"/><circle cx="480" cy={y(135)} r="7" fill="var(--green)"/><text x="480" y={y(135) - 20} textAnchor="middle" className="plot-value green">135</text></g> : <g><rect x="447" y="56" width="66" height="100" rx="4" fill="var(--surface)" stroke="var(--line)" strokeDasharray="4 4"/><text x="480" y="119" textAnchor="middle" fill="var(--green)" fontSize="40">?</text></g>}
  </svg>;
}

export function Network({ snapshot, inputs, active = -1 }: { snapshot: Snapshot; inputs: readonly number[]; active?: number }) {
  return <svg className="network" viewBox="0 0 650 380" role="img" aria-label={`Neurona lineal: las contribuciones ${snapshot.contributions.map(v => number(v)).join(', ')} se suman para producir ${number(snapshot.prediction)}.`}>
    <text x="65" y="30" className="axis-text">ENTRADAS</text><text x="285" y="30" className="axis-text">PESOS</text><text x="515" y="30" className="axis-text">PREDICCIÓN</text>
    {inputs.map((value, i) => {
      const y = 90 + i * 105;
      return <g key={i} className={active === i ? 'connection active' : 'connection'}>
        <path d={`M120 ${y} C280 ${y},330 195,470 195`} fill="none" stroke={active === i ? 'var(--green)' : 'var(--line-strong)'} strokeWidth={active === i ? 3 : 1.5}/>
        <path className="signal" d={`M120 ${y} C280 ${y},330 195,470 195`} fill="none" stroke="var(--green)" strokeWidth="2"/>
        <circle cx="85" cy={y} r="34" fill="var(--surface)" stroke={active === i ? 'var(--green)' : 'var(--line-strong)'}/>
        <text x="85" y={y + 7} textAnchor="middle" className="plot-value">{number(value, 0)}</text>
        <rect x="240" y={y - 22} width="103" height="44" rx="4" fill="var(--bg)" stroke={active === i ? 'var(--green)' : 'var(--line)'}/>
        <text x="291" y={y + 5} textAnchor="middle" className="axis-text">w{i + 1} {number(snapshot.weights[i], 4)}</text>
        <text x="185" y={y + 26} className="axis-text cyan">{snapshot.contributions[i] < 0 ? '−' : '+'}{number(Math.abs(snapshot.contributions[i]), 2)}</text>
      </g>;
    })}
    <circle cx="500" cy="195" r="40" fill="var(--green)"/><text x="500" y="207" fontSize="39" fill="var(--bg)" textAnchor="middle">∑</text>
    <path d="M540 195h72" stroke="var(--green)" strokeWidth="2"/>
    <text x="575" y="165" className="axis-text">ŷ</text><text x="575" y="238" textAnchor="middle" className="network-result">{number(snapshot.prediction)}</text>
  </svg>;
}

export function HistoryPlot({ history, target, comparison = false }: { history: readonly Snapshot[]; target: number; comparison?: boolean }) {
  const series = history.map(p => comparison ? p.prediction : p.loss);
  const logarithmic = !comparison && Math.max(...series) > 1e6;
  const transform = (v: number) => logarithmic ? Math.log10(1 + v) : v;
  const extrema = [...series.map(transform), 0, ...(comparison ? [target] : [])];
  let min = Math.min(...extrema); let max = Math.max(...extrema);
  if (max - min < 1e-8) { min -= 1; max += 1; }
  const x = (i: number) => 68 + i / Math.max(1, series.length - 1) * 470;
  const y = (v: number) => 211 - (transform(v) - min) / (max - min) * 170;
  const ticks = [min, (max + min) / 2, max];
  return <svg viewBox="0 0 570 270" className="history-plot" role="img" aria-label={comparison ? `Evolución de la predicción. Valor actual ${number(series.at(-1)!)} y objetivo ${number(target)} USD.` : `Pérdida real de entrenamiento. ${history.length - 1} pasos. Valor actual ${number(series.at(-1)!, 4)} USD al cuadrado.${logarithmic ? ' Escala logarítmica log10(1+L).' : ''}`}>
    <text x="14" y="18" className="axis-text">{comparison ? 'USD' : logarithmic ? 'log₁₀(1 + L)' : 'L · USD²'}</text>
    {ticks.map((t, i) => <g key={i}><line x1="68" x2="538" y1={211 - i * 85} y2={211 - i * 85} className="plot-grid"/><text x="57" y={216 - i * 85} textAnchor="end" className="axis-text">{number(t, Math.abs(t) < 10 ? 1 : 0)}</text></g>)}
    {comparison && <><line x1="68" x2="538" y1={y(target)} y2={y(target)} stroke="var(--cyan)" strokeDasharray="5 5"/><text x="530" y={y(target) - 8} textAnchor="end" className="axis-text cyan">y = {number(target, 0)}</text></>}
    <polyline points={series.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={comparison ? 'var(--green)' : 'var(--coral)'} strokeWidth="2" strokeLinejoin="round"/>
    <circle cx={x(series.length - 1)} cy={y(series.at(-1)!)} r="4" fill={comparison ? 'var(--green)' : 'var(--coral)'}/>
    <text x="68" y="244" className="axis-text">0</text><text x="538" y="244" textAnchor="end" className="axis-text">{history.length - 1}</text><text x="300" y="259" textAnchor="middle" className="axis-text">Iteración</text>
  </svg>;
}

export function ContourPlot({ example, history }: { example: Example; history: readonly Snapshot[] }) {
  const clip = useId(); const arrow = useId();
  const current = history[history.length - 1];
  const w = current.weights; const [a, b] = example.inputs;
  const contours = makeContours(example, current, Math.max(0.18, Math.abs(w[0]) * 0.3, Math.abs(w[1]) * 0.3));
  const span = Math.max(0.18, Math.abs(w[0]) * 0.3, Math.abs(w[1]) * 0.3);
  const scale = 210 / span;
  const px = (v: number) => 300 + (v - w[0]) * scale;
  const py = (v: number) => 235 - (v - w[1]) * scale;
  const unitG = Math.hypot(current.gradient[0], current.gradient[1]);
  return <svg viewBox="0 0 600 500" className="contour-plot" data-testid="landscape-2d" role="img" aria-label={`Curvas de nivel reales de la pérdida con peso tres fijo en ${number(w[2], 4)}. Marcador actual y dirección de descenso proyectada.`}>
    <defs><clipPath id={clip}><rect x="60" y="25" width="480" height="420"/></clipPath><marker id={arrow} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3" fill="none" stroke="var(--green)"/></marker></defs>
    {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1={90 + i * 105} x2={90 + i * 105} y1="25" y2="445" className="plot-grid"/><line x1="60" x2="540" y1={25 + i * 105} y2={25 + i * 105} className="plot-grid"/></g>)}
    <g clipPath={`url(#${clip})`}>
      {contours.map(({ residual, points }, i) => <line key={i} x1={300 + points[0][0] * 210} y1={235 - points[0][1] * 210} x2={300 + points[1][0] * 210} y2={235 - points[1][1] * 210} stroke={residual === 0 ? 'var(--green)' : 'var(--cyan)'} opacity={residual === 0 ? 1 : 0.5} strokeWidth={residual === 0 ? 2 : 1}/>)}
      <polyline points={history.map(p => `${px(p.weights[0])},${py(p.weights[1])}`).join(' ')} stroke="var(--coral)" strokeWidth="2" strokeDasharray="4 3" fill="none"/>
      {unitG > 1e-10 && <line x1="300" y1="235" x2={300 - current.gradient[0] / unitG * 70} y2={235 + current.gradient[1] / unitG * 70} stroke="var(--green)" strokeWidth="2" markerEnd={`url(#${arrow})`}/>}
      <circle cx="300" cy="235" r="6" fill="var(--green)" stroke="var(--bg)" strokeWidth="2"/>
    </g>
    <text x="300" y="485" textAnchor="middle" className="axis-text">w₁ · {number(w[0] - span, 3)} a {number(w[0] + span, 3)}</text>
    <text x="10" y="18" className="axis-text">w₂</text><text x="60" y="460" className="axis-text">{number(w[1] - span, 3)}</text><text x="60" y="20" className="axis-text">{number(w[1] + span, 3)}</text>
    <text x="525" y="43" textAnchor="end" className="axis-text green">{a === 0 && b === 0 ? `Sección plana · L = ${number(current.loss)}` : contours.some(line => line.residual === 0) ? 'Valle · L = 0' : 'L = 0 fuera de esta vista'}</text>
  </svg>;
}
