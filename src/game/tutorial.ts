// 🧭 C2: tutorial liviano. Cada paso sale del estado del juego (no hay que guardar nada) y
// desaparece solo cuando lo hiciste. Solo en la primera carrera.
import { INITIAL_SKILLS } from '../data/skills'
import { INITIAL_TECH } from '../data/techs'
import type { GameState } from './reducer'

export type TutorialStep = 'offer' | 'click' | 'deliver' | 'upgrade' | null

const total = (levels: Record<string, number>) => Object.values(levels).reduce((a, b) => a + b, 0)

/** Clics que hace falta ver al jugador antes de dejar de explicar cómo programar */
const CLICKS_TO_LEARN = 10

export function tutorialStep(state: GameState, upgradesAvailable: number): TutorialStep {
  if (state.prestige.sales > 0) return null
  const { contract } = state
  if (state.records.contracts === 0) {
    if (!contract) return 'offer'
    if (state.code >= contract.code) return 'deliver'
    return state.records.clicks < CLICKS_TO_LEARN ? 'click' : null
  }
  // Primera mejora: hay XP para algo y todavía no compraste nada con XP
  const bought = total(state.tech) > total(INITIAL_TECH) || total(state.skills) > total(INITIAL_SKILLS)
  return !bought && upgradesAvailable > 0 ? 'upgrade' : null
}
