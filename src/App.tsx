import { lazy, Suspense, useEffect, useState } from 'react';
import { Walkthrough } from './components/Walkthrough';
import { Laboratory } from './components/Laboratory';
import { Foundations } from './components/Foundations';
import { Home } from './components/Home';
import { Arrow, Mark } from './components/shared';
import { useSimulation } from './state/useSimulation';

const Cinema = lazy(() => import('./components/Cinema').then(module => ({ default: module.Cinema })));

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
  const cinema = hash === '#/presentacion';
  useEffect(() => {
    if (chapter) setLastChapter(chapter);
    dispatch({ type: 'play', value: false });
    const title = chapter ? `Capítulo ${chapter} — Gradient Lab` : hash === '#/presentacion' ? 'Presentación cinematográfica — Gradient Lab' : hash === '#/laboratorio' ? 'Laboratorio — Gradient Lab' : foundations ? 'Fundamentos — Gradient Lab' : 'Gradient Lab — Aprender del error';
    document.title = title;
    const frame = requestAnimationFrame(() => {
      const anchor = hash.startsWith('#/fundamentos#') ? hash.split('#')[2] : null;
      const main = document.getElementById('main');
      main?.setAttribute('tabindex', '-1');
      if (!anchor && main?.contains(document.activeElement) && document.activeElement !== main) return;
      const target = anchor ? document.getElementById(anchor) : document.getElementById('main');
      if (anchor) target?.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      main?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, chapter, foundations, dispatch]);
  return <><a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Saltar al contenido</a><header className="site-header"><a className="wordmark" href="#/" aria-label="Gradient Lab, inicio"><Mark/><span>GRADIENT <strong>LAB</strong></span></a><nav aria-label="Navegación principal"><a href={`#/aprender/${lastChapter}`} aria-current={chapter ? 'page' : undefined}>Experimento</a><a href="#/laboratorio" aria-current={hash === '#/laboratorio' ? 'page' : undefined}>Laboratorio</a><a href="#/fundamentos" aria-current={foundations ? 'page' : undefined}>Fundamentos</a></nav><span className="header-status mono"><span className="dot green-dot"/>EL CÁLCULO ESTÁ VIVO</span></header>
    {cinema ? <Suspense fallback={<main id="main" className="cinema-loading"><h1>El error está vivo.</h1><a href="#/">Volver al inicio</a></main>}><Cinema state={simulation.state} dispatch={dispatch}/></Suspense> : chapter ? <Walkthrough key={tourVersion} chapter={chapter} dispatch={dispatch} restart={() => { setTourVersion(v => v + 1); window.location.hash = '/aprender/1'; }}/>
      : hash === '#/laboratorio' ? <Laboratory state={simulation.state} dispatch={dispatch}/>
      : foundations ? <Foundations/>
      : hash === '#/' || hash === '#' ? <Home dispatch={dispatch}/>
      : <main id="main" className="page-width not-found"><h1>Esta ruta no existe.</h1><p>El experimento sigue aquí.</p><a className="button primary" href="#/">Volver al inicio<Arrow/></a></main>}
    <footer className="site-footer"><span>GRADIENT LAB <span className="muted">/ Aprender del error</span></span><span>Datos hipotéticos. Ciencia real.</span><a href="#/fundamentos">Fuentes y créditos<Arrow/></a></footer></>;
}
