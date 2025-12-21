import { useRef, useCallback } from 'react';

/**
 * Debounce simples (sem libs externas)
 * Retorna uma função estável que agenda execuções.
 */
export function useDebouncedCallback(fn, delay = 350) {
  const tRef = useRef(null);

  return useCallback(
    (...args) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}
