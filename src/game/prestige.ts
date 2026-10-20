// Prestigio: vender la empresa a cambio de tokens de inversión (GDD §10).

/** Lo que sobrevive a una venta */
export type Prestige = {
  /** Tokens de inversión sin gastar */
  tokens: number
  /** Cuántas empresas vendiste */
  sales: number
}

export const INITIAL_PRESTIGE: Prestige = { tokens: 0, sales: 0 }

/** Tokens por vender apenas se abre el modo infinito */
export const BASE_TOKENS: number = 3

/** Valor de empresa del primer hito extra; cada hito siguiente pide el doble */
export const FIRST_MILESTONE: number = 2_500_000

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
