import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function useVisibility<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    let intersects = true;
    const update = () => setVisible(intersects && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); }, { rootMargin: '80px' });
    observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  return [ref, visible];
}

export function Atmosphere({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = root.current?.parentElement;
    const light = root.current?.querySelector<HTMLElement>('.atmosphere-light');
    if (!active || !parent || !light || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = parent.getBoundingClientRect();
      light.style.transform = `translate3d(${(event.clientX - bounds.left - bounds.width / 2) * 0.035}px,${(event.clientY - bounds.top - bounds.height / 2) * 0.035}px,0)`;
    };
    const reset = () => { light.style.transform = 'translate3d(0,0,0)'; };
    parent.addEventListener('pointermove', move, { passive: true });
    parent.addEventListener('pointerleave', reset);
    return () => { parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', reset); };
  }, [active]);
  return <div ref={root} className="atmosphere" data-active={active} aria-hidden="true">
    <div className="atmosphere-light"/><div className="atmosphere-orbit"/><div className="atmosphere-sweep"/>
    <svg className="atmosphere-coordinates" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor">{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${120 + i * 120} 0v800M0 ${80 + i * 80}h1200`}/>)}<path d="M598 360v80m-40-40h80M118 76v16m-8-8h16M1078 716v16m-8-8h16"/></g></svg>
  </div>;
}
