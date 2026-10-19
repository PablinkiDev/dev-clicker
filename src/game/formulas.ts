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
export function skillCost(baseCost: number, currentLevel: number): number {
  return Math.ceil(baseCost * Math.pow(1.5, currentLevel))
}

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

/** Precio de un Desarrollador ★ (GDD §5, experimental) */
export const DEVELOPER_PRICE: number = 2600

/** Líneas por segundo que escribe cada Desarrollador ★ (GDD §5, experimental) */
export const DEVELOPER_RATE: number = 2

/** Producción automática total del equipo, en líneas por segundo */
export function autoRate(developers: number): number {
  return developers * DEVELOPER_RATE
}

/** Puestos para empleados en la habitación inicial: vos + 2 (GDD §6) */
export const ROOM_CAPACITY: number = 2
