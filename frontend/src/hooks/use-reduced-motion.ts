import { useReducedMotion } from "framer-motion";

/**
 * Retorna as props de animação corretas para um <motion.*> do framer-motion,
 * respeitando a preferência do sistema "prefers-reduced-motion".
 *
 * Uso:
 *   const motion = useMotionProps({ initial, animate, transition });
 *   <motion.div {...motion} />
 *
 * Quando reduced-motion está ativo, initial e animate ficam iguais
 * (sem deslocamento nem fade), zerando durations e delays.
 */
export function useMotionProps<T extends Record<string, unknown>>(props: {
  initial: T;
  animate: T;
  transition?: Record<string, unknown>;
  whileInView?: T;
  viewport?: Record<string, unknown>;
}): typeof props {
  const reduced = useReducedMotion();

  if (!reduced) return props;

  // Com reduced-motion: remove deslocamento, mantém opacidade visível imediatamente.
  const still = { ...props.animate } as T;

  return {
    ...props,
    initial: still,
    animate: still,
    whileInView: props.whileInView ? still : undefined,
    transition: { duration: 0, delay: 0 },
  };
}
