import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { chapters } from '../content/chapters';
import { DEFAULT_EXAMPLE, evaluate, stability, step } from '../math/engine';
import type { Action, Simulation } from '../state/simulation';
import { Atmosphere, useVisibility } from './Atmosphere';
import { ChapterExperiment } from './Walkthrough';
import { Landscape } from './Landscape';
import { HistoryPlot } from './Plots';
import { Arrow, Formula, LiveNumber, Mark, number } from './shared';
import cartelUrl from '../../docs/Cartel.pdf?url';

const initial = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
const adjusted = step(DEFAULT_EXAMPLE, initial.weights);
const sceneNames = ['La entrada', ...chapters.map(chapter => chapter.title), 'Entrenamiento en vivo', 'Lo que aprendimos'];

export function Cinema({ state, dispatch }: { state: Simulation; dispatch: Dispatch<Action> }) {
  const [scene, setScene] = useState(0);
  const [cue, setCue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState('');
  const [descent, setDescent] = useState(initial);
  const [ref, visible] = useVisibility<HTMLElement>();
  const heading = useRef<HTMLHeadingElement>(null);
  const lastTrainingCue = useRef(0);
  const ownsFullscreen = useRef(false);
  const current = state.history[state.history.length - 1];
  const condition = stability(state.config.inputs, state.config.eta);
  const chapter = scene > 0 && scene < 8 ? chapters[scene - 1] : null;
  const go = useCallback((index: number, manual = true) => {
    setScene(Math.max(0, Math.min(9, index))); setCue(0); setDescent(initial);
    if (manual) setPlaying(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    dispatch({ type: 'play', value: false });
    heading.current?.focus({ preventScroll: true });
  }, [scene, dispatch]);
  useEffect(() => {
    const pause = () => { setPlaying(false); dispatch({ type: 'play', value: false }); };
    const visibility = () => { if (document.hidden) pause(); };
    const keys = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable)) return;
      if (event.key === 'Escape') { event.preventDefault(); window.location.hash = '/'; }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(scene + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(scene - 1); }
      if (event.code === 'Space' && !(event.target instanceof HTMLElement && event.target.closest('button, a, summary'))) {
        event.preventDefault(); setPlaying(value => !value);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause); window.addEventListener('keydown', keys);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', pause); window.removeEventListener('keydown', keys);
    };
  }, [scene, dispatch, go]);
  useEffect(() => () => {
    dispatch({ type: 'play', value: false });
    if (ownsFullscreen.current && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }, [dispatch]);
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) { await document.documentElement.requestFullscreen(); ownsFullscreen.current = true; }
      else setNotice('Puedes continuar en esta ventana; pantalla completa no está disponible.');
    } catch { setNotice('El navegador no permite pantalla completa. Puedes continuar aquí.'); }
  }
  useEffect(() => {
    if (!playing || !visible) return;
    const cues = window.setInterval(() => setCue(value => value + 1), 2400);
    const next = window.setTimeout(() => { if (scene < 9) go(scene + 1, false); else setPlaying(false); }, 16000);
    return () => { clearInterval(cues); clearTimeout(next); };
  }, [playing, visible, scene, go]);
  useEffect(() => {
    if (cue === 0) lastTrainingCue.current = 0;
    if (scene === 8 && playing && cue > lastTrainingCue.current) {
      lastTrainingCue.current = cue; dispatch({ type: 'step', count: 1 });
    }
  }, [scene, playing, cue, dispatch]);
  return <main id="main" ref={ref} className="cinema" data-scene={scene} data-regime={scene === 8 ? condition.kind : 'stable'}>
    <Atmosphere active={visible}/>
    <header className="cinema-header"><a className="wordmark" href="#/" aria-label="Gradient Lab, inicio"><Mark/><span>GRADIENT <strong>LAB</strong></span></a><span className="mono">Presentación cinematográfica</span><a className="text-button" href="#/">Salir<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5"/></svg></a></header>
    <div className={`cinema-stage cinema-act-${scene}`} key={`${scene}-${version}`}>
      <div className="cinema-copy"><h1 ref={heading} tabIndex={-1}>{scene === 0 ? <>El error<br/><em>está vivo.</em></> : scene === 8 ? <>El cálculo.<br/><em>En tus manos.</em></> : scene === 9 ? <>Aprender<br/><em>es cambiar.</em></> : chapter!.heading.split('\n').map((line, i) => <span key={line} className={i ? 'cinema-emphasis' : ''}>{line}</span>)}</h1>
        <p>{scene === 0 ? 'Una predicción, un error y una dirección. Entra en el cálculo que permite aprender a una neurona.' : scene === 8 ? 'Cada paso cambia tres pesos. Todos los instrumentos observan el mismo experimento real.' : scene === 9 ? 'Con la tasa del cartel, una iteración reduce la pérdida. Cambiar el paso puede cambiar el resultado.' : chapter!.idea}</p>
        {chapter && <><Formula>{chapter.formula}</Formula><p className="cinema-note">{chapter.note}</p></>}
        {scene === 0 && <div className="cinema-opening-values"><div><span>Predicción inicial</span><strong>{number(initial.prediction, 0)}</strong><small>USD</small></div><div><span>Pérdida inicial</span><strong>{number(initial.loss, 0)}</strong><small>USD²</small></div></div>}
        {scene === 9 && <><div className="cinema-conclusion"><strong>{number(100 * (1 - adjusted.loss / initial.loss))}<small>%</small></strong><span>menos pérdida en una iteración</span></div><p className="cinema-note">Mejorar este dato no demuestra generalización. Los precios son hipotéticos; no hay cotizaciones ni predicciones financieras reales.</p><div className="cinema-credits"><span>Hanniel Cardoso Jaramillo<br/>Angel Joseph Estrada Santos</span><span>UNAM · Facultad de Ingeniería<br/>Cálculo Vectorial · Grupo 13 · 2027-1</span></div><div className="cinema-source-links"><a href="#/fundamentos">Fuentes y fundamentos<Arrow/></a><a href={cartelUrl} target="_blank" rel="noreferrer">Cartel original<Arrow/></a></div></>}
      </div>
      <div className="cinema-visual" onClickCapture={event => { if (event.target instanceof HTMLElement && event.target.closest('button, a, input')) setPlaying(false); }}>
        {scene === 0 ? <Landscape hero active={visible} example={DEFAULT_EXAMPLE} history={cue > 1 ? [initial, adjusted] : [initial]}/>
          : scene === 8 ? <div className="cinema-training"><div className="cinema-readouts"><div><span>Predicción · USD</span><LiveNumber data-testid="cinema-prediction" value={current.prediction} label="Predicción actual"/></div><div><span>Pérdida · USD²</span><output>{number(current.loss, 4)}</output></div><div><span>Pasos</span><output>{state.history.length - 1}</output></div></div><Landscape example={state.config} history={state.history}/><div className="cinema-training-controls"><button type="button" className="button primary" aria-label="Calcular un paso en presentación" onClick={() => { setPlaying(false); dispatch({ type: 'step', count: 1 }); }}>Calcular un paso<Arrow/></button><button type="button" className="button secondary" onClick={() => { setPlaying(false); dispatch({ type: 'step', count: 10 }); }}>Calcular diez</button><button type="button" className="text-button" onClick={() => { setPlaying(false); dispatch({ type: 'preset', preset: 'stable' }); }}>Estable</button><button type="button" className="text-button" onClick={() => { setPlaying(false); dispatch({ type: 'preset', preset: 'divergent' }); }}>Divergente</button><a className="text-button" href="#/laboratorio">Laboratorio completo<Arrow/></a></div><p className="cinema-note" role="status">{state.message}</p></div>
          : scene === 9 ? <div className="cinema-result-field"><HistoryPlot comparison history={[initial, adjusted]} target={DEFAULT_EXAMPLE.target}/><div className="cinema-final-equation"><span>{number(initial.prediction, 0)}</span><Arrow/><strong>{number(adjusted.prediction)}</strong><small>objetivo {DEFAULT_EXAMPLE.target} USD</small></div><a className="button primary" href="#/laboratorio">Ahora experimenta tú<Arrow/></a></div>
          : scene === 5 ? <div className="cinema-gradient-stage"><Landscape example={DEFAULT_EXAMPLE} history={descent.weights.every((weight, i) => weight === initial.weights[i]) ? [initial] : [initial, descent]}/><ChapterExperiment chapter={scene} dispatch={dispatch} cue={cue} onSnapshot={setDescent}/></div>
          : <ChapterExperiment chapter={scene} dispatch={dispatch} cue={cue}/>}
      </div>
    </div>
    <footer className="cinema-console"><div className="cinema-timeline" aria-label="Escenas de la presentación">{sceneNames.map((name, i) => <button key={name} type="button" aria-label={`Escena ${i + 1}: ${name}`} aria-current={scene === i ? 'step' : undefined} title={name} onClick={() => go(i)}><span className="mono">{String(i + 1).padStart(2, '0')}</span><i/></button>)}</div><div className="cinema-transport"><div><span className="mono" data-testid="cinema-progress">{scene + 1} / 10</span><span>{sceneNames[scene]}</span></div><div className="cinema-playback"><button type="button" className="text-button" aria-label="Escena anterior" disabled={scene === 0} onClick={() => go(scene - 1)}><Arrow back/></button><button type="button" className="button secondary" aria-label={playing ? 'Pausar presentación' : 'Reproducir presentación'} onClick={() => { if (!playing && scene === 9) go(0, false); setPlaying(value => !value); }}>{playing ? 'Pausar' : 'Reproducir'}<svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{playing ? <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2"/> : <path d="m8 5 11 7-11 7Z" stroke="currentColor" strokeWidth="1.5"/>}</svg></button><button type="button" className="text-button" aria-label="Escena siguiente" disabled={scene === 9} onClick={() => go(scene + 1)}><Arrow/></button></div><div className="cinema-utility"><button type="button" className="text-button" aria-label="Restaurar presentación" onClick={() => { setVersion(value => value + 1); dispatch({ type: 'reset' }); go(0); }}>Restaurar</button><button type="button" className="text-button" onClick={() => void fullscreen()}>Pantalla completa</button><span className="mono">← → escenas · Espacio pausa · Esc salir</span></div></div><p className="sr-only" role="status">{notice}</p></footer>
  </main>;
}
