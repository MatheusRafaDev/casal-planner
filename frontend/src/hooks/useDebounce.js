import { useState, useEffect } from 'react';

/**
 * Retarda a atualização de um valor por `delay` ms.
 * Útil para evitar chamadas de API a cada keystroke.
 *
 * @param {*}      value - Valor a ser "debounced"
 * @param {number} delay - Delay em ms (padrão: 400)
 * @returns O valor debounced
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
