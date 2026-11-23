import { useEffect, useState } from 'react';
import type { Dispatch } from 'react';
import { chapters } from '../content/chapters';
import { DEFAULT_EXAMPLE, evaluate, gradient, jacobian, step, vector } from '../math/engine';
import type { Action, Preset } from '../state/simulation';
import type { Snapshot } from '../math/engine';
import { Arrow, Formula, number } from './shared';
import { Network, PricePlot } from './Plots';

const initial = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
const after = step(DEFAULT_EXAMPLE, initial.weights);
const uphill = evaluate(DEFAULT_EXAMPLE, vector(initial.weights.map((w, i) => w + DEFAULT_EXAMPLE.eta * initial.gradient[i])));

export function ChapterExperiment({ chapter, dispatch, cue = 0, onSnapshot }: { chapter: number; dispatch: Dispatch<Action>; cue?: number; onSnapshot?: (snapshot: Snapshot) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState(0);
  const [lossView, setLossView] = useState(false);
  const [built, setBuilt] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [ascending, setAscending] = useState(false);
  const [preset, setPreset] = useState<Preset>('stable');
  useEffect(() => {
    if (!cue) return;
    setRevealed(true); setActive((cue - 1) % 3); setBuilt(true);
    setLossView(cue > 1); setUpdated(cue > 1);
  }, [cue]);
  useEffect(() => {
    if (chapter === 5) onSnapshot?.(updated ? ascending ? uphill : after : initial);
  }, [chapter, updated, ascending, onSnapshot]);

  switch (chapter) {
    case 1: return <div className="chapter-reto">
      <div className="visual-heading"><span>La información disponible</span><span className="mono">x ∈ ℝ³</span></div>
      <PricePlot snapshot={initial} revealed={revealed}/>
      <div className="reveal-action"><button type="button" className="button secondary" onClick={() => setRevealed(v => !v)}>{revealed ? 'Ocultar objetivo' : 'Revelar objetivo'}<Arrow/></button>
        <span className="mono">y = <strong data-testid="revealed-target">{revealed ? number(DEFAULT_EXAMPLE.target, 0) : '?'}</strong></span></div>
    </div>;
    case 2: return <div className="chapter-network">
      <Network snapshot={initial} inputs={DEFAULT_EXAMPLE.inputs} active={active}/>
      <div className="connection-select">{initial.weights.map((w, i) => <button key={i} type="button" aria-label={`Inspeccionar peso ${i + 1}`} aria-pressed={active === i} onClick={() => setActive(i)}><span>w<sub>{i + 1}</sub></span><strong>{number(w, 1)}</strong></button>)}</div>
      <div className="contribution-detail" data-testid="contribution-detail"><span className="mono">APORTE DE x{active + 1}</span><strong>{number(DEFAULT_EXAMPLE.inputs[active], 0)} × {number(initial.weights[active], 1)} = <span className="green">{number(initial.contributions[active], 0)}</span></strong><span>USD a la predicción</span></div>
      <Formula>{initial.contributions.map(v => number(v, 0)).join(' + ')} = {number(initial.prediction, 0)} USD</Formula>
    </div>;
    case 3: return <div className="chapter-error">
      <div className="error-comparison"><div><span>Predicción</span><strong>{number(initial.prediction, 0)}</strong><span className="mono">ŷ₀ · USD</span></div><div className="error-gap"><span className="coral">{number(initial.error, 0)}</span><svg viewBox="0 0 160 30" aria-hidden="true"><path d="M2 15h156M8 9l-6 6 6 6M152 9l6 6-6 6"/></svg></div><div><span>Valor real</span><strong className="green">{number(DEFAULT_EXAMPLE.target, 0)}</strong><span className="mono">y · USD</span></div></div>
      <div className="segmented wide"><button type="button" aria-pressed={!lossView} onClick={() => setLossView(false)}>Error con signo</button><button type="button" aria-pressed={lossView} onClick={() => setLossView(true)}>Pérdida cuadrática</button></div>
      <div className="error-readout"><span>{lossView ? 'La magnitud de equivocarse' : 'La dirección de la diferencia'}</span><strong className="coral">{lossView ? number(initial.loss, 0) : number(initial.error, 0)}<small>{lossView ? 'USD²' : 'USD'}</small></strong><Formula>{lossView ? `L₀ = ½(${number(initial.error, 0)})² = ${number(initial.loss, 0)}` : `e₀ = ${number(initial.prediction, 0)} − ${DEFAULT_EXAMPLE.target} = ${number(initial.error, 0)}`}</Formula><p>{lossView ? 'Elevar al cuadrado elimina el signo. La mitad simplifica la derivada: ∂L/∂ŷ = ŷ − y.' : 'El signo negativo indica que la predicción quedó por debajo del objetivo.'}</p></div>
    </div>;
    case 4: {
      const perturbed = [...initial.weights]; perturbed[active] += 0.01;
      const prediction = evaluate(DEFAULT_EXAMPLE, perturbed).prediction;
      const g = gradient(DEFAULT_EXAMPLE.inputs, initial.weights, DEFAULT_EXAMPLE.target);
      return <div className="chapter-jacobian">
        <div className="matrix-header"><span>Una salida × tres pesos</span><span className="mono">J ∈ ℝ¹ˣ³</span></div>
        <div className="matrix-construction"><span className="matrix-symbol">J =</span><div className="matrix" data-testid="jacobian-built">{jacobian(DEFAULT_EXAMPLE.inputs)[0].map((value, i) => <span key={i} className={built ? 'matrix-entry revealed' : 'matrix-entry'} style={{ animationDelay: `${i * 90}ms` }}><span className="matrix-source" aria-hidden="true">w{i + 1} = {number(initial.weights[i], 1)}<svg viewBox="0 0 18 40" fill="none"><path d="M9 0v31m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="36" r="2" fill="currentColor"/></svg></span><strong className="matrix-value">{built ? value : '·'}</strong><small>∂ŷ/∂w{i + 1}</small></span>)}</div></div>
        <button type="button" className="button secondary" onClick={() => setBuilt(v => !v)}>{built ? 'Reconstruir jacobiana' : 'Construir jacobiana'}<Arrow/></button>
        <div className="sensitivity-test"><p>Prueba local: aumenta un peso en <strong>0.01</strong>.</p><div className="segmented wide">{[0, 1, 2].map(i => <button key={i} type="button" aria-pressed={active === i} onClick={() => { setActive(i); setBuilt(true); }}>Mover w{i + 1}</button>)}</div><Formula>Δŷ = {DEFAULT_EXAMPLE.inputs[active]} × 0.01 = <span className="cyan">{number(prediction - initial.prediction)}</span> USD</Formula><p>La sensibilidad x{active + 1} convierte el movimiento del peso en cambio de salida.</p></div>
        <div className="chain-rule" data-built={built}><span>Ahora, de la salida a la pérdida</span><Formula>∇wL = Jᵀe = ({g.map((v, i) => <span className={active === i ? 'gradient-term selected' : 'gradient-term'} key={i} style={{ animationDelay: `${i * 100}ms` }}>{i ? ', ' : ''}{number(v, 0)}</span>)})ᵀ</Formula><p>Por ejemplo: ∂L/∂w{active + 1} = ({number(initial.error, 0)})({DEFAULT_EXAMPLE.inputs[active]}) = {number(g[active], 0)}.</p></div>
      </div>;
    }
    case 5: {
      const preview = ascending ? uphill : after;
      return <div className="chapter-descent">
        <div className="descent-direction"><div className="direction-arrow" data-ascending={ascending}><svg viewBox="0 0 160 160" aria-hidden="true"><path d="M35 125L125 35M65 35h60v60"/></svg></div><div><span>{ascending ? 'En dirección del gradiente' : 'En dirección opuesta al gradiente'}</span><strong>{ascending ? '+∇L' : '−∇L'}</strong><span className={ascending ? 'coral' : 'green'}>L: {number(initial.loss, 0)} → {number(preview.loss, 4)}</span></div></div>
        <div className="segmented wide"><button type="button" aria-pressed={!ascending} onClick={() => { setAscending(false); setUpdated(false); }}>Descender</button><button type="button" aria-pressed={ascending} onClick={() => { setAscending(true); setUpdated(false); }}>Ascender</button></div>
        <p className="mono">η = {DEFAULT_EXAMPLE.eta}</p>
        <div className="weight-updates" data-testid="updated-weights">{initial.weights.map((w, i) => <div key={i}><span className="mono">w{i + 1}</span><span>{number(w, 4)}</span><Arrow/><strong className={updated ? ascending ? 'coral' : 'green' : ''}>{updated ? number(preview.weights[i], 4) : '—'}</strong><span className="weight-shift" aria-hidden="true"><i style={{ transform: `scaleX(${w / Math.max(...initial.weights, ...preview.weights)})` }}/><i style={{ transform: `scaleX(${(updated ? preview.weights[i] : w) / Math.max(...initial.weights, ...preview.weights)})` }}/></span></div>)}</div>
        <button type="button" className="button primary" onClick={() => setUpdated(true)}>Actualizar los tres pesos<Arrow/></button>
        <p>{ascending ? 'Sumar el gradiente aleja la predicción en este caso. Prueba la dirección de descenso.' : 'Los tres ajustes se calculan primero y se aplican juntos, desde w⁽⁰⁾.'}</p>
      </div>;
    }
    case 6: return <div className="chapter-result"><div className="segmented wide"><button type="button" aria-pressed={!updated} onClick={() => setUpdated(false)}>Antes</button><button type="button" aria-pressed={updated} onClick={() => setUpdated(true)}>Después</button></div><PricePlot snapshot={updated ? after : initial}/><div className="result-reduction"><strong>{number(100 * (1 - after.loss / initial.loss))}<small>%</small></strong><span>menos pérdida<br/>en una iteración</span></div><Formula>ŷ: {number(initial.prediction, 0)} → {number(after.prediction)}<br/>L: {number(initial.loss, 0)} → {number(after.loss, 4)}</Formula></div>;
    default: return <div className="chapter-open"><div className="rate-presets">{(['slow', 'stable', 'divergent'] as const).map((key, i) => <button type="button" key={key} aria-pressed={preset === key} onClick={() => setPreset(key)}><span>{['Lento', 'Estable', 'Divergente'][i]}</span><strong className="mono">η = {[0.000001, 0.00001, 0.00008][i]}</strong><span>{['Pasos pequeños. Avance gradual.', 'El paso del cartel.', 'Un salto más allá del valle.'][i]}</span></button>)}</div><Formula>0 &lt; η &lt; 2 / {DEFAULT_EXAMPLE.inputs.reduce((sum, x) => sum + x * x, 0)}</Formula><a className="button primary" href="#/laboratorio" onClick={() => dispatch({ type: 'preset', preset })}>Abrir este experimento<Arrow/></a><p>Podrás cambiar pesos y tasa, ejecutar pasos, pausar y explorar el paisaje del error.</p></div>;
  }
}

export function Walkthrough({ chapter, dispatch, restart }: { chapter: number; dispatch: Dispatch<Action>; restart: () => void }) {
  const content = chapters[chapter - 1];
  const [presentation, setPresentation] = useState(false);
  const [experimentVersion, setExperimentVersion] = useState(0);
  useEffect(() => {
    if (!presentation) return;
    const navigate = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable)) return;
      if (event.key === 'Escape') setPresentation(false);
      if (['ArrowRight', 'ArrowLeft'].includes(event.key)) {
        event.preventDefault();
        window.location.hash = `/aprender/${Math.max(1, Math.min(7, chapter + (event.key === 'ArrowRight' ? 1 : -1)))}`;
      }
    };
    window.addEventListener('keydown', navigate);
    return () => window.removeEventListener('keydown', navigate);
  }, [chapter, presentation]);
  return <main id="main" className={`walkthrough chapter-${chapter} ${presentation ? 'presentation' : ''}`}>
    <aside className="chapter-sidebar" aria-label="Capítulos del experimento"><div className="chapter-progress"><span>El experimento</span><span className="mono" data-testid="chapter-progress">{chapter} / 7</span></div><nav aria-label="Índice del recorrido">{chapters.map((c, i) => <a href={`#/aprender/${i + 1}`} key={c.title} aria-current={chapter === i + 1 ? 'step' : undefined}><span className="chapter-index">{String(i + 1).padStart(2, '0')}</span><span>{c.title}</span><span className="chapter-status" aria-hidden="true"/></a>)}</nav><button type="button" className="text-button restart" onClick={restart}>Reiniciar recorrido<svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V3m0 6h6M4 9a8 8 0 111 9" stroke="currentColor" strokeWidth="1.5"/></svg></button></aside>
    <section className="chapter-main"><div className="presentation-toolbar"><button type="button" className="text-button" aria-pressed={presentation} onClick={() => setPresentation(v => !v)}>{presentation ? 'Salir de presentación' : 'Modo presentación'}<svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5" stroke="currentColor" strokeWidth="1.5"/></svg></button><a href="#/presentacion" className="text-button">Presentación cinematográfica<Arrow/></a>{presentation && <><span className="mono">← → capítulos · Esc salir</span><button className="text-button" type="button" onClick={() => { setExperimentVersion(v => v + 1); dispatch({ type: 'reset' }); window.location.hash = '/aprender/1'; }}>Restaurar experimento</button><a href="#/aprender/6" className="text-button">Mostrar comparación<Arrow/></a></>}</div><div className="chapter-copy" key={`copy-${chapter}`}><h1 tabIndex={-1}>{content.heading.split('\n').map((line, i) => <span key={line} className={i ? 'muted-title' : ''}>{line}</span>)}</h1><p className="chapter-idea">{content.idea}</p></div>
      <div className="chapter-body"><div className="chapter-visual" key={`${chapter}-${experimentVersion}`}><ChapterExperiment chapter={chapter} dispatch={dispatch}/></div><div className="chapter-explanation"><h2>{content.title}</h2><Formula>{content.formula}</Formula><p>{content.note}</p><div className="try-note"><span className="dot green-dot"/><p>{content.interaction}</p></div></div></div>
      <nav className="chapter-navigation" aria-label="Navegar recorrido"><a className="text-button" href={chapter > 1 ? `#/aprender/${chapter - 1}` : '#/'} aria-label={chapter > 1 ? 'Capítulo anterior' : 'Volver al inicio'}><Arrow back/>{chapter > 1 ? 'Anterior' : 'Inicio'}</a><span className="mono">{String(chapter).padStart(2, '0')} — {content.title}</span>{chapter < 7 ? <a className="button primary" aria-label="Siguiente capítulo" href={`#/aprender/${chapter + 1}`}>Continuar<Arrow/></a> : <a className="button primary" href="#/laboratorio">Laboratorio<Arrow/></a>}</nav>
    </section>
  </main>;
}
