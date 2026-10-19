// Fórmulas del juego como funciones puras: reciben datos y devuelven un resultado,
// sin tocar React ni el estado. Así se pueden probar y reutilizar en cualquier lado.

/** Nivel máximo de "Escritura veloz" (GDD §8) */
export const FAST_TYPING_MAX_LEVEL: number = 5

/** Costo base de "Escritura veloz" en XP (GDD §8) */
const FAST_TYPING_BASE_COST: number = 30

/** Líneas que suma cada clic según el nivel de "Escritura veloz": 1 + nivel */
export function linesPerClick(fastTypingLevel: number): number {
  return 1 + fastTypingLevel
}

/**
 * Costo del siguiente nivel con la curva suave del GDD (§11):
 * ceil(costo_base × 1,5^(nivel−1)), donde "nivel" es el que se va a comprar.
 * Como acá recibimos el nivel actual, el que se compra es currentLevel + 1.
 */
export function fastTypingCost(currentLevel: number): number {
  return Math.ceil(FAST_TYPING_BASE_COST * Math.pow(1.5, currentLevel))
}

/**
 * Suma código sin pasarse del objetivo del contrato (GDD §11):
 * min(código objetivo, código actual + producción)
 */
export function addCode(current: number, amount: number, target: number): number {
  return Math.min(target, current + amount)
}

/** Dinero que se pierde al vencer un contrato: 5 % de lo que tenés (GDD §4) */
export function failureMoneyLoss(money: number): number {
  return Math.floor(money * 0.05)
}

/** Reputación que se pierde al vencer un contrato */
export const FAILURE_REP_LOSS: number = 1

/** XP que se gana igual al fallar: 20 % de la recompensa ("por la experiencia") */
export function failureXp(rewardXp: number): number {
  return Math.ceil(rewardXp * 0.2)
}
