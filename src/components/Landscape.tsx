import { Component, lazy, Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import type { Example, Snapshot } from '../math/engine';
import { ContourPlot } from './Plots';
import { number } from './shared';

const Scene = lazy(() => import('../scene/Landscape3D'));

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function Landscape({ example, history }: { example: Example; history: readonly Snapshot[] }) {
  const [webgl, setWebgl] = useState(supportsWebGL);
  const [dimension, setDimension] = useState<2 | 3>(3);
  const [view, setView] = useState({ rotation: 0, zoom: 1, reset: 0 });
  const current = history[history.length - 1];
  const fallback = <ContourPlot example={example} history={history}/>;
  const show3D = webgl && dimension === 3;
  return <section className="landscape" aria-labelledby="landscape-title">
    <div className="instrument-heading"><h2 id="landscape-title">El paisaje del error</h2><div className="segmented" aria-label="Dimensión del paisaje">
      <button type="button" aria-label="Ver en 3D" aria-pressed={show3D} disabled={!webgl} onClick={() => setDimension(3)}>3D</button>
      <button type="button" aria-label="Ver en 2D" aria-pressed={!show3D} onClick={() => setDimension(2)}>2D</button>
    </div></div>
    <p className="landscape-constraint mono">Sección: w₃ fijo = <strong>{number(current.weights[2], 4)}</strong> · altura = L</p>
    <div className="landscape-stage">
      {show3D ? <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><Scene example={example} history={history} view={view} onFailure={() => setWebgl(false)}/></Suspense></SceneBoundary> : fallback}
      {show3D && <div className="camera-controls" aria-label="Controles de cámara">
        <button type="button" aria-label="Rotar cámara a la izquierda" onClick={() => setView(v => ({ ...v, rotation: v.rotation - 0.35 }))}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h9a5 5 0 010 10"/></svg></button>
        <button type="button" aria-label="Rotar cámara a la derecha" onClick={() => setView(v => ({ ...v, rotation: v.rotation + 0.35 }))}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 4l4 4-4 4M17 8H8a5 5 0 000 10"/></svg></button>
        <button type="button" aria-label="Acercar cámara" disabled={view.zoom >= 1.8} onClick={() => setView(v => ({ ...v, zoom: Math.min(1.8, v.zoom + 0.2) }))}>+</button>
        <button type="button" aria-label="Alejar cámara" disabled={view.zoom <= 0.6} onClick={() => setView(v => ({ ...v, zoom: Math.max(0.6, v.zoom - 0.2) }))}>−</button>
        <button type="button" aria-label="Restablecer cámara" onClick={() => setView(v => ({ rotation: 0, zoom: 1, reset: v.reset + 1 }))}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7V2m0 5h5M3 7a7 7 0 111 8"/></svg></button>
      </div>}
    </div>
    <div className="plot-legend"><span><i className="dot green-dot"/>Estado actual</span><span><i className="legend-line coral-line"/>Historial proyectado</span><span className="green">−∇L en el plano de pesos</span></div>
    <details className="landscape-explanation"><summary>Cómo leer esta sección {webgl ? '' : '· alternativa sin WebGL'}</summary>
      <p>La superficie es L = ½(x₁w₁ + x₂w₂ + x₃w₃ − y)² con w₃ fijo en el valor actual. {example.inputs[0] === 0 && example.inputs[1] === 0 ? 'Con x₁ = x₂ = 0, esta sección es constante: mover esos dos pesos no cambia la pérdida.' : 'Tiene un valle y una dirección plana.'} La altura usa una escala lineal que se ajusta al dominio visible.</p>
      <p>La trayectoria cambia tres pesos. Aquí se muestra la <strong>proyección del historial sobre w₃ actual</strong>: cada altura se recalcula con ese w₃. El marcador actual sí muestra su pérdida real; las gráficas temporales conservan las pérdidas originales. La flecha es el descenso proyectado en (w₁,w₂), con longitud normalizada.</p>
      <p>{show3D ? 'Arrastra para rotar y usa la rueda para acercarte; también puedes usar los botones de cámara con el teclado.' : 'Las líneas son curvas de igual pérdida. La línea verde corresponde a L = 0 si atraviesa el dominio. El historial conserva sus coordenadas w₁ y w₂.'}</p>
    </details>
  </section>;
}
