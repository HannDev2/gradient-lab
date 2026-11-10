import { useEffect, useState } from 'react';
import { Walkthrough } from './components/Walkthrough';
import { Laboratory } from './components/Laboratory';
import { Foundations } from './components/Foundations';
import { SurfacePreview } from './components/SurfacePreview';
import { Arrow, Mark } from './components/shared';
import { useSimulation } from './state/useSimulation';

function Home() {
  return <main id="main" className="home page-width"><div className="home-topline"><span>UNAM · Facultad de Ingeniería</span><span className="mono">CÁLCULO VECTORIAL / 2027-1</span></div><div className="home-experiment"><div className="home-copy"><h1 aria-label="GRADIENT LAB">GRADIENT<br/><span>LAB</span><span className="title-period">.</span></h1><p className="home-subtitle">Aprender del error:<br/>el gradiente y la matriz jacobiana.</p><p className="home-concept">Una inteligencia artificial no aprende porque conoce las respuestas. <span>Aprende porque puede medir sus errores.</span></p><div className="home-actions"><a className="button primary" href="#/aprender/1">Comenzar experimento<Arrow/></a><a className="text-button" href="#/laboratorio">Explorar laboratorio<Arrow/></a></div></div><div className="home-field"><SurfacePreview/><div className="field-caption"><span className="dot green-dot"/><p>Un error no es el final.<br/><strong>Es una dirección.</strong></p><span className="mono">∇L</span></div></div></div><div className="home-bottom"><p>Una neurona. Tres pesos.<br/><span>Todo un paisaje por explorar.</span></p><div className="home-sequence mono"><span>PREDECIR</span><Arrow/><span>MEDIR</span><Arrow/><span>AJUSTAR</span></div><a href="#/fundamentos" className="text-button">El cálculo detrás<Arrow/></a></div><div className="academic-signature"><span>Hanniel Cardoso Jaramillo · Angel Joseph Estrada Santos</span><span>Grupo 13 · Proyecto estudiantil independiente</span></div></main>;
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [lastChapter, setLastChapter] = useState(1);
  const [tourVersion, setTourVersion] = useState(0);
  const simulation = useSimulation();
  const { dispatch } = simulation;
  useEffect(() => {
    const change = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const chapterMatch = /^#\/aprender\/([1-7])$/.exec(hash);
  const chapter = chapterMatch ? Number(chapterMatch[1]) : null;
  const foundations = hash.startsWith('#/fundamentos');
  useEffect(() => {
    if (chapter) setLastChapter(chapter);
    dispatch({ type: 'play', value: false });
    const title = chapter ? `Capítulo ${chapter} — Gradient Lab` : hash === '#/laboratorio' ? 'Laboratorio — Gradient Lab' : foundations ? 'Fundamentos — Gradient Lab' : 'Gradient Lab — Aprender del error';
    document.title = title;
    const frame = requestAnimationFrame(() => {
      const anchor = hash.startsWith('#/fundamentos#') ? hash.split('#')[2] : null;
      const target = anchor ? document.getElementById(anchor) : document.getElementById('main');
      if (anchor) target?.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main')?.setAttribute('tabindex', '-1');
      document.getElementById('main')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, chapter, foundations, dispatch]);
  return <><a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Saltar al contenido</a><header className="site-header"><a className="wordmark" href="#/" aria-label="Gradient Lab, inicio"><Mark/><span>GRADIENT <strong>LAB</strong></span></a><nav aria-label="Navegación principal"><a href={`#/aprender/${lastChapter}`} aria-current={chapter ? 'page' : undefined}>Experimento</a><a href="#/laboratorio" aria-current={hash === '#/laboratorio' ? 'page' : undefined}>Laboratorio</a><a href="#/fundamentos" aria-current={foundations ? 'page' : undefined}>Fundamentos</a></nav><span className="header-status mono"><span className="dot green-dot"/>EL CÁLCULO ESTÁ VIVO</span></header>
    {chapter ? <Walkthrough key={tourVersion} chapter={chapter} dispatch={dispatch} restart={() => { setTourVersion(v => v + 1); window.location.hash = '/aprender/1'; }}/>
      : hash === '#/laboratorio' ? <Laboratory state={simulation.state} dispatch={dispatch}/>
      : foundations ? <Foundations/>
      : hash === '#/' || hash === '#' ? <Home/>
      : <main id="main" className="page-width not-found"><h1>Esta ruta no existe.</h1><p>El experimento sigue aquí.</p><a className="button primary" href="#/">Volver al inicio<Arrow/></a></main>}
    <footer className="site-footer"><span>GRADIENT LAB <span className="muted">/ Aprender del error</span></span><span>Datos hipotéticos. Ciencia real.</span><a href="#/fundamentos">Fuentes y créditos<Arrow/></a></footer></>;
}
