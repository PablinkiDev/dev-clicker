// 🐛 Bug dorado (D5): aparece de vez en cuando; si lo atrapás, el equipo produce el doble un rato.

/** Multiplicador de la producción automática mientras dura */
export const BUG_MULTIPLIER: number = 2

/** Segundos que dura el efecto */
export const BUG_DURATION: number = 30

/** Segundos que el bug queda en pantalla antes de escaparse (+2 s por nivel de Ojo de halcón) */
export const BUG_VISIBLE: number = 12

export function bugVisible(hawkEye: number): number {
  return BUG_VISIBLE + 2 * hawkEye
}

/** Espera entre apariciones: de 2 a 4 minutos al azar (−15 % por nivel de Ojo de halcón) */
export function nextBugDelay(hawkEye = 0): number {
  return (120 + Math.random() * 120) * 1000 * (1 - 0.15 * hawkEye)
}
