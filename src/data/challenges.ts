// 🏁 Desafíos de run (F5): al empezar una empresa nueva (después de la primera venta) podés elegir
// una regla que complica la partida. Si vendés la empresa con el desafío, ganás más tokens.
// La primera vez que completás cada uno, te llevás cajas extra.
import type { CardEffects } from './cards'

export type Challenge = {
  id: string
  icon: string
  name: string
  rule: string
  /** Tokens extra al vender (0,5 = +50 %) */
  tokenBonus: number
  /** Efectos sobre la partida (mismo motor que cartas y artefactos) */
  effects?: Partial<CardEffects>
  /** No se puede cambiar de editor */
  nanoOnly?: boolean
  /** No se ofrecen cartas al ascender */
  noCards?: boolean
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'tiedHands',
    icon: '🙌',
    name: 'Manos atadas',
    rule: 'Tus clics escriben ×0,25',
    tokenBonus: 0.75,
    effects: { clickMult: 0.25 },
  },
  {
    id: 'sleepyTeam',
    icon: '🦥',
    name: 'Equipo con sueño',
    rule: 'Tu equipo produce ×0,5',
    tokenBonus: 0.75,
    effects: { autoMult: 0.5 },
  },
  {
    id: 'againstTheClock',
    icon: '⏱',
    name: 'Contrarreloj',
    rule: 'Los plazos de los contratos son ×0,5',
    tokenBonus: 0.5,
    effects: { timeMult: 0.5 },
  },
  {
    id: 'bootstrapped',
    icon: '💸',
    name: 'Bootstrapped',
    rule: 'Los contratos pagan ×0,6',
    tokenBonus: 0.5,
    effects: { payMult: 0.6 },
  },
  {
    id: 'nanoForever',
    icon: '🐧',
    name: 'Nano para siempre',
    rule: 'No podés cambiar de editor: toda la empresa en Nano',
    tokenBonus: 0.5,
    nanoOnly: true,
  },
  {
    id: 'noCards',
    icon: '🃏',
    name: 'Sin especializaciones',
    rule: 'No hay cartas al ascender',
    tokenBonus: 0.5,
    noCards: true,
  },
]

/** Cajas extra la primera vez que completás cada desafío */
export const CHALLENGE_FIRST_BOXES = 2

export const getChallenge = (id: string | null) => (id ? CHALLENGES.find((c) => c.id === id) : undefined)
