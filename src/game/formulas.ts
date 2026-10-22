// Fórmulas del juego como funciones puras: reciben datos y devuelven un resultado,
// sin tocar React ni el estado. Así se pueden probar y reutilizar en cualquier lado.

/** Líneas que suma cada clic: 1 + nivel de "Escritura veloz" + bonus del editor */
export function linesPerClick(fastTypingLevel: number, editorBonus: number): number {
  return 1 + fastTypingLevel + editorBonus
}

/**
 * Costo del siguiente nivel de una habilidad con la curva suave del GDD (§11):
 * ceil(costo_base × 1,5^(nivel−1)), donde "nivel" es el que se va a comprar.
 * Como acá recibimos el nivel actual, el que se compra es currentLevel + 1.
 */
export function skillCost(baseCost: number, currentLevel: number, minStage = 0): number {
  return Math.ceil(baseCost * XP_STAGE_COST[minStage] * Math.pow(1.5, currentLevel))
}

/**
 * Recargo de las mejoras según la etapa en que se desbloquean (E2): así el árbol de cada etapa
 * se termina cerca del ascenso, en vez de comprarse entero apenas llegás
 */
export const XP_STAGE_COST: number[] = [1, 1.8, 1.8, 2, 4]

/** Probabilidad base de crítico */
const BASE_CRIT_CHANCE: number = 0.05

/** Probabilidad de crítico: 5 % base + 2 puntos por nivel de "Código crítico" (GDD §8) + bonus del editor */
export function critChance(criticalCodeLevel: number, editorBonus: number): number {
  return BASE_CRIT_CHANCE + 0.02 * criticalCodeLevel + editorBonus
}

/** Multiplicador de XP: +5 % por nivel de "Pensamiento lógico" (GDD §8) */
export function xpMultiplier(logicalThinkingLevel: number): number {
  return 1 + 0.05 * logicalThinkingLevel
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

/** Clics por segundo que suponemos para estimar si un contrato llega a tiempo */
export const ASSUMED_CLICKS_PER_SECOND: number = 5

/** Segundos estimados para completar un contrato: clics supuestos + producción automática */
export function estimateSeconds(code: number, perClick: number, auto: number): number {
  return code / (ASSUMED_CLICKS_PER_SECOND * perClick + auto)
}
