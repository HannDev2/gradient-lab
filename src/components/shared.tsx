import { useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';

export function number(value: number, digits = 2): string {
  if (Math.abs(value) >= 1e6 || (value !== 0 && Math.abs(value) < 1e-5)) return value.toExponential(2);
  return value.toFixed(digits);
}

export function LiveNumber({ value, digits = 2, label, ...props }: { value: number; digits?: number; label: string } & ComponentProps<'output'>) {
  const element = useRef<HTMLOutputElement>(null);
  const previous = useRef(value);
  useEffect(() => {
    const changed = previous.current !== value; previous.current = value;
    if (!changed || !element.current?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = element.current.animate([{ opacity: .45, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    return () => animation.cancel();
  }, [value]);
  return <output {...props} ref={element} aria-live="off" aria-label={`${label}: ${number(value, digits)}`}>{number(value, digits)}</output>;
}

export function Arrow({ back = false }: { back?: boolean }) {
  return <svg className={back ? 'icon arrow-back' : 'icon'} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function Mark() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M5 8h30L20 34Z" stroke="currentColor" strokeWidth="2"/><path d="M12 8l8 17 8-17M8 15h24" stroke="currentColor" strokeWidth="1"/><circle cx="20" cy="18" r="2" fill="currentColor"/></svg>;
}

export function Formula({ children, label }: { children: ReactNode; label?: string }) {
  return <div className="formula" aria-label={label}>{children}</div>;
}

export function NumericField({ label, value, onCommit, min, max, step = 'any', compact = false }: {
  label: string; value: number; onCommit: (value: number) => void; min?: number; max?: number; step?: number | 'any'; compact?: boolean;
}) {
  const displayValue = String(Number(value.toPrecision(12)));
  const [draft, setDraft] = useState(displayValue);
  const [error, setError] = useState('');
  useEffect(() => { setDraft(displayValue); setError(''); }, [displayValue]);
  function commit() {
    const next = Number(draft);
    const invalid = draft.trim() === '' || !Number.isFinite(next);
    const message = invalid ? 'Escribe un número finito.' : min !== undefined && next < min ? `Debe ser mayor o igual a ${min}.` : max !== undefined && next > max ? `Debe ser menor o igual a ${max}.` : '';
    setError(message);
    if (!message && draft !== displayValue && next !== value) onCommit(next);
  }
  return <label className={`numeric-field ${compact ? 'compact' : ''}`}>
    <span className={compact ? 'sr-only' : ''}>{label}</span>
    <input type="number" aria-label={label} aria-invalid={!!error} value={draft} min={min} max={max} step={step}
      onChange={event => { setDraft(event.target.value); setError(''); }} onBlur={commit}
      onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') { setDraft(displayValue); setError(''); } }} />
    {error && <span role="alert" className="field-error">{error}</span>}
  </label>;
}
