import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { DEFAULT_EXAMPLE, evaluate, step, vector } from '../math/engine';
import type { Action } from '../state/simulation';
import { Atmosphere, useVisibility } from './Atmosphere';
import { Landscape } from './Landscape';
import { Network } from './Plots';
import { SurfacePreview } from './SurfacePreview';
import { Arrow, Formula, number } from './shared';

const initial = evaluate(DEFAULT_EXAMPLE, DEFAULT_EXAMPLE.weights);
const adjusted = step(DEFAULT_EXAMPLE, initial.weights);
const ascending = evaluate(DEFAULT_EXAMPLE, vector(initial.weights.map((w, i) => w + DEFAULT_EXAMPLE.eta * initial.gradient[i])));
const phases = ['Predecir', 'Medir', 'Derivar', 'Ajustar'];
const descriptions = [
  'Tres contribuciones viajan hacia una única salida. Cada peso decide cuánto aporta su entrada.',
  'La respuesta conocida convierte una predicción en un error con signo. La pérdida mide su magnitud.',
  'La regla de la cadena devuelve el error a los pesos, multiplicándolo por sus sensibilidades.',
  'Los tres pesos se actualizan a la vez. La siguiente predicción utiliza el nuevo estado.',
];

function LearningCircuit() {
  const [phase, setPhase] = useState(0);
  const formulas = [
    `${initial.contributions.join(' + ')} = ${number(initial.prediction, 0)} USD`,
    `e = ${number(initial.error, 0)} USD · L = ${number(initial.loss, 0)} USD²`,
    `∇wL = (${initial.gradient.join(', ')})ᵀ`,
    `w⁽¹⁾ = (${adjusted.weights.map(w => number(w, 4)).join(', ')})`,
  ];
  return <div className="learning-circuit" data-phase={phase}>
    <div className="circuit-stages" aria-label="Operaciones del aprendizaje">{phases.map((label, i) => <button key={label} type="button" aria-label={label} aria-pressed={phase === i} onClick={() => setPhase(i)}><span className="mono">0{i + 1}</span><span>{label}</span><Arrow/></button>)}</div>
    <div className="circuit-drawing"><Network snapshot={phase === 3 ? adjusted : initial} inputs={DEFAULT_EXAMPLE.inputs} active={phase === 0 ? 1 : -1}/>
      <svg className="feedback-path" viewBox="0 0 650 95" aria-hidden="true"><path d="M555 8v28Q555 60 530 60H92Q65 60 65 35V8"/><path d="M56 21l9-13 9 13"/></svg>
      <div className="circuit-feedback"><span className="mono">{phase < 2 ? 'DE LA ENTRADA A LA PREDICCIÓN' : 'DEL ERROR A LOS PESOS'}</span><Formula><span data-testid="circuit-formula">{formulas[phase]}</span></Formula><p>{descriptions[phase]}</p></div>
    </div>
  </div>;
}

export function Home({ dispatch }: { dispatch: Dispatch<Action> }) {
  const [heroRef, heroVisible] = useVisibility<HTMLElement>();
  const root = useRef<HTMLElement>(null);
  const [trained, setTrained] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [uphill, setUphill] = useState(false);
  const [weight, setWeight] = useState(0.3);
  const heroCurrent = trained ? adjusted : initial;
  const preview = evaluate(DEFAULT_EXAMPLE, [weight, 0.3, 0.3]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-seen'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    root.current?.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return <main id="main" ref={root} className="home-v2">
    <section ref={heroRef} className="living-hero" data-moment="entrada" data-active={heroVisible} aria-label="La entrada al laboratorio">
      <Atmosphere active={heroVisible}/>
      <div className="hero-academic page-width"><span>UNAM · Facultad de Ingeniería</span><span className="mono">CÁLCULO VECTORIAL / 2027-1</span></div>
      <div className="hero-composition page-width">
        <div className="hero-editorial"><h1 aria-label="GRADIENT LAB"><span className="hero-word">GRADIENT</span><span className="hero-word">LAB<span className="hero-period">.</span></span></h1>
          <p className="hero-subtitle">Aprender del error:<br/>el gradiente y la matriz jacobiana.</p>
          <p className="hero-thesis">Una inteligencia artificial no aprende porque conoce las respuestas. <strong>Aprende porque puede medir sus errores.</strong></p>
          <div className="home-actions"><a href="#/aprender/1" className="button primary">Comenzar experimento<Arrow/></a><a href="#/laboratorio" className="text-button">Explorar laboratorio<Arrow/></a></div>
        </div>
        <div className="hero-observatory"><Landscape hero active={heroVisible} example={DEFAULT_EXAMPLE} history={trained ? [initial, adjusted] : [initial]}/>
          <div className="hero-experiment"><div><span className="mono">PÉRDIDA · USD²</span><output data-testid="hero-loss">{number(heroCurrent.loss, 4)}</output></div><button className="experiment-trigger" type="button" aria-label={trained ? 'Restablecer iteración de portada' : 'Observar una iteración'} onClick={() => setTrained(v => !v)}><span className="trigger-icon"><Arrow/></span><span>{trained ? 'Volver al origen' : 'Observar una iteración'}<small>{trained ? `ŷ = ${number(heroCurrent.prediction)}` : `η = ${DEFAULT_EXAMPLE.eta}`}</small></span></button></div>
        </div>
      </div>
      <div className="hero-bottom page-width"><span><i className="dot green-dot"/> Un error no es el final. Es una dirección.</span><a className="text-button" href="#reto" onClick={e => { e.preventDefault(); document.getElementById('reto')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Explora el proceso<Arrow/></a></div>
    </section>

    <section className="home-reto narrative-section" id="reto" data-moment="reto" aria-labelledby="reto-title">
      <div className="page-width"><div className="narrative-heading" data-reveal><h2 id="reto-title">Lo que sabemos.<br/><span>Lo que todavía no.</span></h2><p>Tres precios hipotéticos. Una respuesta oculta.<br/>La neurona recibe los datos; tú descubres cómo aprende a combinarlos.</p></div>
        <div className="data-horizon" data-revealed={revealed} data-reveal><svg viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 150H1200M0 85H1200M0 20H1200" className="horizon-scale"/><path d="M100 120L433 90 766 60"/><path className="unknown-segment" d={`M766 60L1100 ${revealed ? 15 : 60}`}/></svg>
          {DEFAULT_EXAMPLE.inputs.map((value, i) => <div className="observed-datum" key={i}><span className="mono">DÍA {i + 1} · x{i + 1}</span><strong>{value}</strong><span className="mono">USD · conocido</span></div>)}
          <button type="button" className="hidden-datum" aria-label="Destapar objetivo de la portada" aria-pressed={revealed} onClick={() => setRevealed(v => !v)}><span className="mono">DÍA 4 · y</span><strong data-testid="home-target">{revealed ? DEFAULT_EXAMPLE.target : '?'}</strong><span>{revealed ? 'Objetivo revelado' : 'Toca para descubrir'}</span></button>
        </div><p className="source-note mono">CASO DIDÁCTICO · PRECIOS INVENTADOS · SIN COTIZACIONES REALES</p>
      </div>
    </section>

    <section className="home-mechanism narrative-section page-width" id="mecanismo" data-moment="mecanismo" aria-labelledby="mechanism-title"><div className="mechanism-intro" data-reveal><h2 id="mechanism-title">Aprender es<br/><span>cerrar un circuito.</span></h2><p>La respuesta no aparece por magia.<br/>Viaja hacia delante como predicción.<br/>Vuelve como una forma de corregirse.</p><a className="text-button" href="#/aprender/2">Seguir cada conexión<Arrow/></a></div><div data-reveal><LearningCircuit/></div></section>

    <section className="home-direction narrative-section" id="direccion" data-moment="direccion" aria-labelledby="direction-title"><div className="page-width"><div className="narrative-heading" data-reveal><h2 id="direction-title">Un error tiene<br/><span>dirección.</span></h2><p>El gradiente señala dónde crece la pérdida.<br/>Restarlo convierte la sensibilidad en movimiento.</p></div><div className="direction-composition" data-uphill={uphill} data-reveal><div className="gradient-totem"><span className="gradient-glyph" aria-hidden="true">{uphill ? '+' : '−'}∇L</span><div className="gradient-coordinates">{initial.gradient.map((g, i) => <div key={i}><span className="mono">∂L / ∂w{i + 1}</span><strong>{number(g, 0)}</strong></div>)}</div><div className="direction-choice"><button type="button" aria-label="Descender por la pérdida" aria-pressed={!uphill} onClick={() => setUphill(false)}>Descender<Arrow/></button><button type="button" aria-label="Ascender por la pérdida" aria-pressed={uphill} onClick={() => setUphill(true)}>Ascender<Arrow/></button></div></div><div className="direction-terrain"><SurfacePreview snapshot={uphill ? ascending : adjusted} interactive={false}/><div className="direction-observation"><span>Un paso desde el origen</span><span className="mono">L: {number(initial.loss, 0)} <Arrow/> <output data-testid="direction-loss">{number(uphill ? ascending.loss : adjusted.loss, 4)}</output></span></div></div></div><p className="direction-note">Una observación produce un valle de soluciones. La sección fija w₃ en el valor mostrado; cambiarlo reconstruye el paisaje, no su significado.</p></div></section>

    <section className="home-invitation narrative-section" id="tu-turno" data-moment="turno" aria-labelledby="invitation-title"><div className="page-width invitation-layout"><div data-reveal><h2 id="invitation-title">La siguiente<br/>decisión es <em>tuya.</em></h2><p>Altera un peso. Cambia la tasa. Entrena, pausa y observa.<br/>El laboratorio responde con cálculo real.</p><a className="button invitation-button" href="#/laboratorio" onClick={() => { dispatch({ type: 'reset' }); dispatch({ type: 'weight', index: 0, value: weight }); }}>Continuar con estos pesos<Arrow/></a></div><div className="invitation-instrument" data-reveal><div className="instrument-heading"><h3>Prueba tu primera conexión</h3><span className="mono">EN VIVO</span></div><label htmlFor="home-weight">Peso w₁ <output>{number(weight, 2)}</output></label><input type="range" id="home-weight" aria-label="Probar peso uno en la portada" min="0" max="0.8" step="0.01" value={weight} onChange={e => setWeight(Number(e.target.value))}/><div className="invitation-equation"><span>{DEFAULT_EXAMPLE.inputs[0]} × {number(weight, 2)} + {number(initial.contributions[1], 0)} + {number(initial.contributions[2], 0)}</span><strong><span className="mono">ŷ = </span><output data-testid="home-preview-prediction">{number(preview.prediction)}</output></strong></div><p>Los otros pesos siguen en 0.3. La predicción y la pérdida se recalculan en tu navegador.</p></div></div></section>
    <div className="academic-signature page-width"><span>Hanniel Cardoso Jaramillo · Angel Joseph Estrada Santos</span><span>UNAM · Grupo 13 · Proyecto estudiantil independiente</span></div>
  </main>;
}
