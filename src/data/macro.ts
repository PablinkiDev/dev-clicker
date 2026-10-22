// 🤖 Macro de teclado (E4): una herramienta que hace clic sola, más lenta que una persona.
// Sus clics escriben código igual que los tuyos, pero no son críticos ni cuentan para los logros.

export type MacroLevel = {
  /** Clics por segundo */
  cps: number
  price: number
  /** Etapa mínima (índice en STAGES) */
  minStage: number
  name: string
}

/** Nivel 1 y 2 (el 0 es no tenerla) */
export const MACRO_LEVELS: MacroLevel[] = [
  { cps: 1, price: 3_000_000, minStage: 2, name: 'Macro de teclado' },
  { cps: 2, price: 40_000_000, minStage: 3, name: 'Macro de teclado 2.0' },
]

/** Clics por segundo con el nivel comprado (0 si no hay) */
export function macroCps(level: number): number {
  return level > 0 ? MACRO_LEVELS[level - 1].cps : 0
}
