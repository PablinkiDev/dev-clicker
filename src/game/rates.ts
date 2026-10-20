// Producción del jugador con todos los bonus juntos. La usan el reducer y la interfaz,
// así los números que se ven son exactamente los que se aplican.
import { getEditor } from '../data/editors'
import { linesPerClick } from './formulas'
import { investmentBonus } from './prestige'
import type { GameState } from './reducer'
import { autoRate } from './team'

/** Líneas por clic (sin crítico): habilidad + editor, × Código heredado */
export function clickRate(state: GameState): number {
  const base = linesPerClick(state.skills.fastTyping, getEditor(state.editor).clickBonus)
  return base * investmentBonus(state.prestige.investments.legacyCode)
}

/** Líneas por segundo del equipo y el editor, × Trabajo en equipo × Equipo experimentado */
export function autoRateOf(state: GameState): number {
  return (
    autoRate(state.team, getEditor(state.editor).autoBonus) *
    (1 + 0.05 * state.skills.teamwork) *
    investmentBonus(state.prestige.investments.seniorTeam)
  )
}
