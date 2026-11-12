import { useEffect, useId, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { jacobian, stability, vector } from '../math/engine';
import type { Action, Simulation } from '../state/simulation';
import { Landscape } from './Landscape';
import { HistoryPlot, Network } from './Plots';
import { Arrow, Formula, LiveNumber, NumericField, number } from './shared';

const stabilityCopy = {
  stable: ['Estable', 'La magnitud del error disminuye en cada paso de este modelo.'],
  slow: ['Lento', 'El paso es pequeño: la pérdida disminuye gradualmente.'],
  oscillating: ['Oscilación estable', 'El error cambia de signo, pero su magnitud disminuye. Cruzamos el valle en cada paso.'],
  divergent: ['Divergente', 'La tasa supera el límite estable. Si hay error, su magnitud crece y alterna de signo.'],
  boundary: ['En el límite', 'El error alterna de signo sin reducir su magnitud. Esta tasa no converge.'],
  paused: ['Sin actualización', 'Con η = 0 no cambia ningún peso. Prueba una tasa positiva.'],
  flat: ['Sin sensibilidad', 'Todas las entradas son cero. El gradiente no permite ajustar la salida.'],
} as const;

const metricHelp = {
  prediction: ['Cómo se calcula la predicción', 'ŷ = w · x. Sumamos las tres contribuciones de entradas y pesos. La unidad es USD.'],
  loss: ['Cómo se calcula la pérdida', 'L = ½e². Elevamos el error al cuadrado y dividimos entre dos. La unidad es USD²; nunca es negativa.'],
  error: ['Cómo se calcula el error', 'e = ŷ − y. Negativo: la predicción queda por debajo del objetivo. Positivo: lo supera. La unidad es USD.'],
} as const;

function MetricHelp({ name, expanded, id, onClick }: { name: string; expanded: boolean; id: string; onClick: () => void }) {
  return <span className="metric-help"><button type="button" aria-label={name} aria-expanded={expanded} aria-controls={id} aria-describedby={expanded ? id : undefined} onClick={onClick}><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 5v1"/></svg></button></span>;
}

export function Laboratory({ state, dispatch }: { state: Simulation; dispatch: Dispatch<Action> }) {
  const [batch, setBatch] = useState(10);
  const [help, setHelp] = useState<keyof typeof metricHelp | null>(null);
  const helpId = useId();
  const readouts = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!help) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelp(null); };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !readouts.current?.contains(event.target)) setHelp(null); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    document.getElementById(helpId)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [help, helpId]);
  const helpButton = (metric: keyof typeof metricHelp) => <MetricHelp name={metricHelp[metric][0]} expanded={help === metric} id={helpId} onClick={() => setHelp(help === metric ? null : metric)}/>;
  const current = state.history[state.history.length - 1];
  const first = state.history[0];
  const condition = stability(state.config.inputs, state.config.eta);
  const [status, explanation] = stabilityCopy[condition.kind];
  const reduction = first.loss > 0 ? 100 * (1 - current.loss / first.loss) : null;
  const recent = state.history.slice(-12);
  const errorScale = Math.max(1, ...recent.map(point => Math.abs(point.error)));
  return <main id="main" className="laboratory page-width" data-regime={condition.kind}>
    <div className="page-heading"><div><h1>Tu laboratorio.</h1><p>Cambia una variable. Observa todo lo que cambia con ella.</p></div><a className="text-button" href="#/aprender/1">Volver al experimento<Arrow back/></a></div>
    <div className="lab-toolbar" aria-label="Entrenar el modelo">
      <div className="training-actions"><button type="button" className="button primary" aria-label="Ejecutar un paso" onClick={() => dispatch({ type: 'step', count: 1 })} disabled={state.playing}>Un paso<Arrow/></button><button type="button" className="button secondary" aria-label={state.playing ? 'Pausar entrenamiento' : 'Reproducir entrenamiento'} onClick={() => dispatch({ type: 'play', value: !state.playing })}><svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{state.playing ? <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3"/> : <path d="M8 4l12 8-12 8V4Z" fill="currentColor"/>}</svg>{state.playing ? 'Pausar' : 'Reproducir'}</button></div>
      <div className="batch-control"><NumericField label="Pasos por lote" value={batch} min={1} max={1000} step={1} onCommit={value => setBatch(Math.floor(value))}/><button type="button" className="button secondary" aria-label="Ejecutar lote" disabled={state.playing} onClick={() => dispatch({ type: 'step', count: batch })}>Ejecutar lote</button></div>
      <button type="button" className="text-button reset-example" onClick={() => dispatch({ type: 'reset' })}>Restablecer ejemplo<svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V3m0 6h6M4 9a8 8 0 111 9" stroke="currentColor" strokeWidth="1.5"/></svg></button>
    </div>
    <div className="lab-layout"><aside className="lab-controls" aria-label="Controles del experimento">
      <div className="instrument-heading"><h2>Los parámetros</h2><span className="mono">w ∈ ℝ³</span></div>
      <div className="weights-controls">{current.weights.map((weight, i) => <div className="weight-control" key={i}>
        <div className="weight-control-heading"><label htmlFor={`weight-${i}`} className="weight-symbol">w<sub>{i + 1}</sub></label><NumericField label={`Valor del peso ${i + 1}`} compact digits={6} value={weight} min={-1000000} max={1000000} onCommit={value => dispatch({ type: 'weight', index: i, value })}/></div>
        <input type="range" id={`weight-${i}`} aria-label={`Ajustar peso ${i + 1}`} min={Math.min(-0.5, weight - 0.1)} max={Math.max(1, weight + 0.1)} step="0.0001" value={weight} onChange={e => dispatch({ type: 'weight', index: i, value: Number(e.target.value) })}/>
        <div className="range-scale mono"><span>{number(Math.min(-0.5, weight - 0.1), 1)}</span><span>x{i + 1} = {state.config.inputs[i]}</span><span>{number(Math.max(1, weight + 0.1), 1)}</span></div>
      </div>)}</div>
      <div className="rate-control"><div className="weight-control-heading"><label htmlFor="eta-range">Tasa de aprendizaje <span className="math-inline">η</span></label><span className="mono">PASO</span></div><NumericField compact label="Tasa de aprendizaje exacta" value={state.config.eta} min={0} max={1} onCommit={value => dispatch({ type: 'eta', value })}/>
        <input type="range" id="eta-range" aria-label="Ajustar tasa de aprendizaje" min="0" max={Math.max(0.0001, state.config.eta)} step="0.0000001" value={state.config.eta} onChange={e => dispatch({ type: 'eta', value: Number(e.target.value) })}/>
        <div className="range-scale mono"><span>0</span><span>{Math.max(0.0001, state.config.eta)}</span></div>
      </div>
      <div className="preset-buttons" aria-label="Escenarios de entrenamiento">{([0.000001, 0.00001, 0.00004, 0.00008]).map((rate, i) => <button key={rate} type="button" aria-pressed={state.config.eta === rate} onClick={() => { dispatch({ type: 'reset' }); dispatch({ type: 'eta', value: rate }); }}>{['Lento', 'Estable', 'Oscilatorio', 'Divergente'][i]}</button>)}</div>
      <div className={`stability-note ${condition.kind === 'divergent' || condition.kind === 'boundary' ? 'is-warning' : ''}`}><strong data-testid="stability"><span className="dot"/>{status}</strong><p>{explanation}</p><span className="mono">{condition.limit ? `Estable: 0 < η < ${condition.limit.toFixed(11)}` : '‖x‖² = 0'}</span></div>
      <div className="error-dynamics"><div><span>El error conserva su signo<br/>o cruza el valle según q.</span><strong className="mono" data-testid="error-factor">q = {number(condition.factor, 3)}</strong></div><svg viewBox="0 0 240 84" role="img" aria-label={`Últimos ${recent.length} errores reales con signo; cero en el eje central. Factor actual ${condition.factor}.`}><path d="M4 42H236" className="plot-grid"/><polyline points={recent.map((point, i) => `${8 + i / Math.max(1, recent.length - 1) * 224},${42 - point.error / errorScale * 32}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2"/>{recent.map((point, i) => <circle key={i} cx={8 + i / Math.max(1, recent.length - 1) * 224} cy={42 - point.error / errorScale * 32} r="2.5" fill="currentColor"/>)}</svg><span className="mono">e(t+1) = q · e(t)<br/>q = 1 − η‖x‖²</span></div>
      <details className="data-editor"><summary>Editar entradas y objetivo</summary><p>Al editar se pausa el entrenamiento y comienza una nueva trayectoria.</p>{state.config.inputs.map((value, i) => <NumericField key={i} label={`Entrada ${i + 1}`} value={value} min={-1000000} max={1000000} onCommit={next => { const inputs = [...state.config.inputs]; inputs[i] = next; dispatch({ type: 'data', inputs: vector(inputs), target: state.config.target }); }}/>) }<NumericField label="Objetivo real" value={state.config.target} min={-1000000} max={1000000} onCommit={target => dispatch({ type: 'data', inputs: state.config.inputs, target })}/></details>
    </aside>
    <div className="lab-observations"><div ref={readouts} className="live-readouts" aria-label="Resultados actuales"><div><span>Predicción <span className="mono">ŷ</span>{helpButton("prediction")}</span><LiveNumber data-testid="prediction" className="green" value={current.prediction} label="Predicción actual"/><span className="mono">objetivo {number(state.config.target)} USD</span></div><div><span>Pérdida <span className="mono">L</span>{helpButton("loss")}</span><LiveNumber data-testid="loss" value={current.loss} digits={4} label="Pérdida actual"/><span className="mono">USD²</span></div><div><span>Error <span className="mono">e</span>{helpButton("error")}</span><LiveNumber className="coral" value={current.error} label="Error actual"/><span className="mono">USD · con signo</span></div><div><span>Iteración</span><output data-testid="iteration">{state.history.length - 1}</output><span className="mono">{state.playing ? 'en curso' : 'en pausa'}</span></div><div id={helpId} role="tooltip" className="metric-tooltip" hidden={!help}>{help && metricHelp[help][1]}</div></div>
      <Landscape example={state.config} history={state.history}/>
      <div className="simulation-message" role="status"><span className="dot green-dot"/><p>{state.message}</p></div>
      <div className="training-plots"><section aria-labelledby="loss-plot-title"><div className="instrument-heading"><h2 id="loss-plot-title">La pérdida, paso a paso</h2><span className="mono coral">L(t)</span></div><HistoryPlot history={state.history} target={state.config.target}/><p>{reduction === null ? 'El experimento comenzó con pérdida cero.' : reduction >= 0 ? `${number(reduction)} % menos pérdida desde el inicio de esta trayectoria.` : `${number(-reduction)} % más pérdida desde el inicio de esta trayectoria.`}</p></section><section aria-labelledby="prediction-plot-title"><div className="instrument-heading"><h2 id="prediction-plot-title">Predicción vs. objetivo</h2><span className="mono green">ŷ(t)</span></div><HistoryPlot comparison history={state.history} target={state.config.target}/><p>La línea discontinua es el objetivo. Comparamos el mismo dato de entrenamiento.</p></section></div>
      <div className="lab-math"><section><h2>Lo que mueve los pesos</h2><span className="mono">JACOBIANA · 1 × 3</span><Formula><span data-testid="lab-jacobian">J = [ {jacobian(state.config.inputs)[0].map(v => number(v, 0)).join('   ')} ]</span></Formula><span className="mono">GRADIENTE · 3 × 1</span><Formula>∇wL = ({current.gradient.map(v => number(v, 2)).join(', ')})ᵀ</Formula><p>∂L/∂wᵢ = ({number(current.error)}) × xᵢ. La siguiente actualización usará este vector.</p></section><section><h2>La suma de contribuciones</h2><Network inputs={state.config.inputs} snapshot={current}/><Formula>ŷ = {current.contributions.map(v => number(v, 3)).join(' + ')}</Formula></section></div>
      <details className="history-table"><summary>Consultar datos del historial ({state.history.length} estados)</summary><div className="table-scroll"><table><caption>Estados reales del entrenamiento, sin proyectar sobre la sección 3D</caption><thead><tr><th scope="col">t</th><th scope="col">w₁</th><th scope="col">w₂</th><th scope="col">w₃</th><th scope="col">ŷ</th><th scope="col">e</th><th scope="col">L</th></tr></thead><tbody>{state.history.map((p, i) => <tr key={i}><th scope="row">{i}</th>{p.weights.map((w, j) => <td key={j}>{number(w, 6)}</td>)}<td>{number(p.prediction, 4)}</td><td>{number(p.error, 4)}</td><td>{number(p.loss, 4)}</td></tr>)}</tbody></table></div></details>
    </div></div>
  </main>;
}
