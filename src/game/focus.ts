// Concentración (GDD §8): potenciador temporal de clics. Se activa a mano y después se recarga.

/** Multiplicador de líneas por clic mientras dura */
export const FOCUS_MULTIPLIER: number = 2

/** Segundos de recarga desde que termina */
export const FOCUS_COOLDOWN: number = 120

/** Duración en segundos según el nivel: 24 s en Nv.1, hasta 60 s en Nv.5 */
export function focusDuration(level: number): number {
  return 15 + 9 * level
}

/** Cuándo termina el efecto y cuándo se puede volver a usar (timestamps en ms) */
export type Focus = { endsAt: number; readyAt: number }

export const INITIAL_FOCUS: Focus = { endsAt: 0, readyAt: 0 }

export function isFocused(focus: Focus, now: number): boolean {
  return now < focus.endsAt
}
