// Prestigio: vender la empresa a cambio de tokens de inversión (GDD §10).
import { INITIAL_INVESTMENTS, type InvestmentLevels } from '../data/investments'

/** Registro de una empresa vendida (GDD §10: historial) */
export type SaleRecord = {
  /** Fecha de la venta (timestamp) */
  soldAt: number
  value: number
  tokens: number
  moneyEarned: number
  contractsDone: number
  contractsFailed: number
  teamSize: number
  /** Contratos entregados en modo infinito */
  endless: number
  /** Segundos jugados con esa empresa (las ventas viejas no lo tienen) */
  playTime?: number
}

/** Lo que sobrevive a una venta */
export type Prestige = {
  /** Tokens de inversión sin gastar */
  tokens: number
  /** Cuántas empresas vendiste */
  sales: number
  /** Niveles del árbol de prestigio */
  investments: InvestmentLevels
  /** Empresas vendidas, la más reciente primero */
  history: SaleRecord[]
}

export const INITIAL_PRESTIGE: Prestige = { tokens: 0, sales: 0, investments: INITIAL_INVESTMENTS, history: [] }

/** Tokens por vender apenas se abre el modo infinito */
export const BASE_TOKENS: number = 3

/** Valor de empresa del primer hito extra; cada hito siguiente pide el doble */
export const FIRST_MILESTONE: number = 40_000_000

/** Valor necesario para el hito número n (0 = el primero) */
export function milestoneValue(n: number): number {
  return FIRST_MILESTONE * Math.pow(2, n)
}

/** Tokens que da vender con este valor: 3 + un token por cada hito alcanzado */
export function tokensForValue(value: number): number {
  let tokens = BASE_TOKENS
  while (value >= milestoneValue(tokens - BASE_TOKENS)) tokens++
  return tokens
}

/** Valor que hace falta para ganar un token más */
export function nextMilestone(value: number): number {
  return milestoneValue(tokensForValue(value) - BASE_TOKENS)
}

/** Multiplicador de una mejora de prestigio de +20 % por nivel */
export function investmentBonus(level: number): number {
  return 1 + 0.2 * level
}
