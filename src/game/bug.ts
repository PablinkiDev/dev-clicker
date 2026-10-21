// 🐛 Bug dorado (D5): aparece de vez en cuando; si lo atrapás, el equipo produce el doble un rato.

/** Multiplicador de la producción automática mientras dura */
export const BUG_MULTIPLIER: number = 2

/** Segundos que dura el efecto */
export const BUG_DURATION: number = 30

/** Segundos que el bug queda en pantalla antes de escaparse */
export const BUG_VISIBLE: number = 12

/** Espera entre apariciones: de 2 a 4 minutos, al azar */
export function nextBugDelay(): number {
  return (120 + Math.random() * 120) * 1000
}
