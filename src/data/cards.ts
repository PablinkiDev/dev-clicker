// 🃏 Especializaciones (F1): al ascender se ofrecen 3 cartas, una por estilo, y se elige una.
// Son la "build" de esta empresa: se apilan entre sí y se pierden al venderla.
// Cada carta es solo datos; game/cards.ts suma sus efectos y los aplica donde corresponde.
import type { GameState } from '../game/reducer'

export type CardStyle = 'click' | 'idle' | 'mix'

export const STYLES: Record<CardStyle, { icon: string; name: string; text: string; color: string }> = {
  click: { icon: '🖱', name: 'Manos rápidas', text: 'el clic manda', color: 'text-yellow' },
  idle: { icon: '🤖', name: 'Automatizador', text: 'el equipo manda', color: 'text-cyan' },
  mix: { icon: '⚖️', name: 'Equilibrado', text: 'lo mejor de los dos', color: 'text-purple' },
}

/** Todo lo que puede tocar una carta. Los "Mult" se multiplican entre sí; el resto se suma */
export type CardEffects = {
  clickMult: number
  autoMult: number
  /** Probabilidad extra de crítico (0,1 = +10 %) */
  critChance: number
  /** Multiplicador extra de los críticos (+1 = ×3 en vez de ×2) */
  critExtra: number
  /** Bonus máximo del combo de clics seguidos (0,5 = hasta +50 %) */
  comboMax: number
  /** Recarga de las habilidades y el Foco (0,7 = 30 % más rápido) */
  cooldownMult: number
  /** Segundos de producción del equipo que suma cada clic, siempre */
  pairSeconds: number
  /** Multiplicador del equipo mientras el Foco está activo */
  focusTeamMult: number
  payMult: number
  xpMult: number
  /** Multiplicador del plazo de los contratos nuevos */
  timeMult: number
  /** Clics por segundo extra de la Macro (si la tenés) */
  macroCps: number
  /** Multiplicador del equipo cuando hace un rato que no hacés clic */
  idleMult: number
  /** El Crunch no cansa */
  crunchNoTired: boolean
  // --- Efectos que hoy solo dan los artefactos (F3) ---
  /** Duración del Foco y las habilidades */
  durationMult: number
  /** Duración de los efectos malos de los eventos */
  badEventMult: number
  /** Código que piden los contratos nuevos */
  codeMult: number
  /** Probabilidad de contratos especiales */
  specialMult: number
  /** Tokens extra al vender */
  saleTokens: number
  /** Multiplicador extra de la Hackatón */
  hackathonExtra: number
  /** Suerte en las apuestas (cada punto, +10 % de chance) */
  luck: number
  /** Fuerza del premio de los minijuegos */
  minigameMult: number
}

export const NO_EFFECTS: CardEffects = {
  clickMult: 1,
  autoMult: 1,
  critChance: 0,
  critExtra: 0,
  comboMax: 0,
  cooldownMult: 1,
  pairSeconds: 0,
  focusTeamMult: 1,
  payMult: 1,
  xpMult: 1,
  timeMult: 1,
  macroCps: 0,
  idleMult: 1,
  crunchNoTired: false,
  durationMult: 1,
  badEventMult: 1,
  codeMult: 1,
  specialMult: 1,
  saleTokens: 0,
  hackathonExtra: 0,
  luck: 0,
  minigameMult: 1,
}

export type Card = {
  id: string
  style: CardStyle
  icon: string
  name: string
  /** Qué hace (normal o rara) */
  text: (rare: boolean) => string
  effects: (rare: boolean) => Partial<CardEffects>
  /** Solo se ofrece si sirve con lo que tenés (por ejemplo, la Macro) */
  available?: (state: GameState) => boolean
}

/** Probabilidad de que una carta ofrecida salga rara (borde dorado, mucho más fuerte) */
export const RARE_CHANCE = 0.1

/** Segundos sin hacer clic para que cuenten las "Horas extra" */
export const IDLE_SECONDS = 5

/** Clics seguidos (sin pausas de más de 1 s) por cada escalón del combo, y cuánto suma cada uno */
export const COMBO_STEP = 10
export const COMBO_BONUS = 0.05

export const CARDS: Card[] = [
  // 🖱 Manos rápidas
  {
    id: 'pianist',
    style: 'click',
    icon: '🎹',
    name: 'Dedos de pianista',
    text: (r) => `Tus clics escriben ×${r ? '2,5' : '1,5'}`,
    effects: (r) => ({ clickMult: r ? 2.5 : 1.5 }),
  },
  {
    id: 'chainCrit',
    style: 'click',
    icon: '⚡',
    name: 'Crítico en cadena',
    text: (r) => `+${r ? 20 : 10} % de probabilidad de crítico`,
    effects: (r) => ({ critChance: r ? 0.2 : 0.1 }),
  },
  {
    id: 'masterStroke',
    style: 'click',
    icon: '💥',
    name: 'Golpe maestro',
    text: (r) => `Los críticos multiplican +${r ? 2 : 1} más`,
    effects: (r) => ({ critExtra: r ? 2 : 1 }),
  },
  {
    id: 'combo',
    style: 'click',
    icon: '🔥',
    name: 'Combo',
    text: (r) => `Clics seguidos suben un combo: hasta +${r ? 100 : 50} % (se corta si parás más de 1 s)`,
    effects: (r) => ({ comboMax: r ? 1 : 0.5 }),
  },
  {
    id: 'quickRecharge',
    style: 'click',
    icon: '🔋',
    name: 'Recarga rápida',
    text: (r) => `El Foco y las habilidades se recargan ${r ? 50 : 30} % más rápido`,
    effects: (r) => ({ cooldownMult: r ? 0.5 : 0.7 }),
  },

  // 🤖 Automatizador
  {
    id: 'scrum',
    style: 'idle',
    icon: '📋',
    name: 'Scrum de verdad',
    text: (r) => `Tu equipo produce ×${r ? '2,5' : '1,5'}`,
    effects: (r) => ({ autoMult: r ? 2.5 : 1.5 }),
  },
  {
    id: 'overtime',
    style: 'idle',
    icon: '🌙',
    name: 'Horas extra',
    text: (r) => `Si pasan ${IDLE_SECONDS} s sin que hagas clic, tu equipo produce ×${r ? 3 : 2}`,
    effects: (r) => ({ idleMult: r ? 3 : 2 }),
  },
  {
    id: 'generousDeadlines',
    style: 'idle',
    icon: '📅',
    name: 'Plazos generosos',
    text: (r) => `Los contratos nuevos tienen +${r ? 50 : 25} % de plazo`,
    effects: (r) => ({ timeMult: r ? 1.5 : 1.25 }),
  },
  {
    id: 'turboMacro',
    style: 'idle',
    icon: '🤖',
    name: 'Macro turbo',
    text: (r) => `Tu Macro de teclado hace +${r ? 2 : 1} clic${r ? 's' : ''}/s`,
    effects: (r) => ({ macroCps: r ? 2 : 1 }),
    available: (s) => s.macro > 0,
  },
  {
    id: 'guiltFreeCrunch',
    style: 'idle',
    icon: '😎',
    name: 'Crunch sin culpa',
    text: (r) => (r ? 'El Crunch no cansa y tu equipo produce ×1,5' : 'El Crunch no cansa'),
    effects: (r) => ({ crunchNoTired: true, autoMult: r ? 1.5 : 1 }),
    available: (s) => s.skills.crunch > 0,
  },

  // ⚖️ Equilibrado
  {
    id: 'pairForever',
    style: 'mix',
    icon: '👯',
    name: 'Pair programming de por vida',
    text: (r) => `Cada clic suma ${r ? '0,4' : '0,2'} s de lo que produce tu equipo`,
    effects: (r) => ({ pairSeconds: r ? 0.4 : 0.2 }),
  },
  {
    id: 'coffeeForAll',
    style: 'mix',
    icon: '☕',
    name: 'Café para todos',
    text: (r) => `Mientras el Foco está activo, tu equipo también produce ×${r ? 3 : 2}`,
    effects: (r) => ({ focusTeamMult: r ? 3 : 2 }),
    available: (s) => s.skills.focus > 0,
  },
  {
    id: 'loyalClient',
    style: 'mix',
    icon: '🤝',
    name: 'Cliente fiel',
    text: (r) => `Los contratos pagan +${r ? 30 : 15} %`,
    effects: (r) => ({ payMult: r ? 1.3 : 1.15 }),
  },
  {
    id: 'mentoring',
    style: 'mix',
    icon: '🧑‍🏫',
    name: 'Mentoría',
    text: (r) => `+${r ? 60 : 30} % de XP por contrato`,
    effects: (r) => ({ xpMult: r ? 1.6 : 1.3 }),
  },
  {
    id: 'allRounder',
    style: 'mix',
    icon: '🦾',
    name: 'Todo terreno',
    text: (r) => `Clics y equipo ×${r ? '1,4' : '1,15'}`,
    effects: (r) => ({ clickMult: r ? 1.4 : 1.15, autoMult: r ? 1.4 : 1.15 }),
  },
]

/** Una carta elegida (o en oferta): cuál y si salió rara */
export type CardPick = { id: string; rare: boolean }

export const getCard = (id: string) => CARDS.find((c) => c.id === id)

/**
 * Las 3 cartas para elegir al ascender: una de cada estilo, al azar entre las que sirven y todavía no
 * tenés. Usa azar: se arma afuera del reducer.
 */
export function drawCards(state: GameState): CardPick[] {
  const owned = new Set(state.cards.map((c) => c.id))
  const picks: CardPick[] = []
  for (const style of ['click', 'idle', 'mix'] as const) {
    const pool = CARDS.filter((c) => c.style === style && !owned.has(c.id) && (c.available?.(state) ?? true))
    if (pool.length === 0) continue
    const card = pool[Math.floor(Math.random() * pool.length)]
    picks.push({ id: card.id, rare: Math.random() < RARE_CHANCE })
  }
  return picks
}
