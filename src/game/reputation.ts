// Reputación (GDD §4): sube el nivel de las ofertas. Más nivel = más ofertas en el tablón
// y contratos más grandes y mejor pagos.

/** Reputación necesaria para cada nivel de ofertas (Nv.1 = índice 0) */
export const REP_LEVELS: number[] = [0, 30, 100, 250, 500]

/** Nivel de ofertas (0 a 4) según la reputación */
export function repLevel(rep: number): number {
  return REP_LEVELS.findLastIndex((threshold) => rep >= threshold)
}

/** Ofertas visibles en el tablón: 3, 3, 4, 4 y 5 */
export function boardSize(level: number): number {
  return 3 + Math.floor(level / 2)
}

/** +10 % de código y de paga por nivel de ofertas */
export function repScale(level: number): number {
  return 1 + 0.1 * level
}

/** Reputación que falta para el siguiente nivel; null si ya es el máximo */
export function nextRepThreshold(rep: number): number | null {
  return REP_LEVELS[repLevel(rep) + 1] ?? null
}
