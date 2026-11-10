import { useEffect, useReducer } from 'react';
import { createSimulation, simulationReducer } from './simulation';

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createSimulation);
  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setInterval(() => dispatch({ type: 'step', count: 1 }), 650);
    return () => window.clearInterval(timer);
  }, [state.playing]);
  return { state, dispatch, current: state.history[state.history.length - 1] };
}
