// Modificadores temporales: el bug dorado y los eventos al azar.
// Cada uno multiplica la producción automática o los clics hasta cierta hora.

export type ModifierTarget = 'auto' | 'click'

export type Modifier = {
  id: string
  /** Emoji que se muestra en el panel ("🐛", "🍕") */
  icon: string
  target: ModifierTarget
  mult: number
  /** Hasta cuándo dura (timestamp en ms) */
  endsAt: number
}

/** Producto de los modificadores activos de un tipo. Sin hora (la simulación), no cuenta ninguno */
export function modifierMultiplier(modifiers: Modifier[], target: ModifierTarget, now: number | undefined): number {
  if (now === undefined) return 1
  return modifiers.filter((m) => m.target === target && now < m.endsAt).reduce((total, m) => total * m.mult, 1)
}

/** Saca los que ya terminaron (para que la lista no crezca para siempre) */
export function activeModifiers(modifiers: Modifier[], now: number): Modifier[] {
  return modifiers.filter((m) => now < m.endsAt)
}
