// ⚡ Habilidades activas (F2): botones con efecto fuerte y recarga. Son el corazón de la build clicker.
// Se aprenden en el árbol personal (el nivel las mejora) y se usan con los botones o las teclas 2–5.
// La Concentración (🎯, tecla 1) existe desde antes y vive en game/focus.ts.
import type { SkillId } from './skills'

export type AbilityId = 'hackathon' | 'crunch' | 'pair' | 'coffee'

export type Ability = {
  id: AbilityId
  /** Habilidad del árbol personal que la desbloquea (su nivel la mejora) */
  skill: SkillId
  icon: string
  name: string
  /** Tecla para usarla */
  key: string
  /** Segundos que dura el efecto (0 = instantánea) */
  duration: (level: number) => number
  /** Segundos de recarga desde que se usa */
  cooldown: (level: number) => number
  /** Qué hace, en texto corto (para el botón y la ayuda) */
  describe: (level: number) => string
}

/** Hackatón: multiplicador de clics */
export const HACKATHON_MULT = 5

/** Crunch: el equipo rinde mucho y después se cansa (el cansancio baja con el nivel) */
export const CRUNCH_MULT = 3
export const CRUNCH_SECONDS = 30
export const crunchTired = (level: number) => Math.min(0.9, 0.3 + 0.2 * level)

/** Pair programming: segundos de producción del equipo que suma cada clic */
export const pairSeconds = (level: number) => 0.5 + 0.5 * level

export const ABILITIES: Ability[] = [
  {
    id: 'hackathon',
    skill: 'hackathon',
    icon: '🏃',
    name: 'Hackatón',
    key: '2',
    duration: (level) => 5 + 5 * level,
    cooldown: () => 300,
    describe: (level) => `Clics ×${HACKATHON_MULT} durante ${5 + 5 * level} s`,
  },
  {
    id: 'crunch',
    skill: 'crunch',
    icon: '🔥',
    name: 'Crunch',
    key: '3',
    duration: () => CRUNCH_SECONDS * 2,
    cooldown: () => 240,
    describe: (level) =>
      `Equipo ×${CRUNCH_MULT} durante ${CRUNCH_SECONDS} s; después se cansa: ×${crunchTired(level).toLocaleString('es-AR')} otros ${CRUNCH_SECONDS} s`,
  },
  {
    id: 'pair',
    skill: 'pairProgramming',
    icon: '👯',
    name: 'Pair programming',
    key: '4',
    duration: () => 20,
    cooldown: () => 180,
    describe: (level) =>
      `Durante 20 s, cada clic suma ${pairSeconds(level).toLocaleString('es-AR')} s de lo que produce tu equipo`,
  },
  {
    id: 'coffee',
    skill: 'doubleCoffee',
    icon: '☕',
    name: 'Café doble',
    key: '5',
    duration: () => 0,
    cooldown: (level) => 720 - 120 * level,
    describe: () => 'Recarga al instante todas tus otras habilidades (y el Foco)',
  },
]

/** Cuándo termina el efecto y cuándo se puede volver a usar (timestamps en ms) */
export type AbilityTimer = { endsAt: number; readyAt: number }

export type AbilityTimers = Record<AbilityId, AbilityTimer>

export const INITIAL_ABILITIES: AbilityTimers = {
  hackathon: { endsAt: 0, readyAt: 0 },
  crunch: { endsAt: 0, readyAt: 0 },
  pair: { endsAt: 0, readyAt: 0 },
  coffee: { endsAt: 0, readyAt: 0 },
}
