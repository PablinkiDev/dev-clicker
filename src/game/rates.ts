// Producción del jugador con todos los bonus juntos. La usan el reducer y la interfaz,
// así los números que se ven son exactamente los que se aplican.
import { getEditor } from '../data/editors'
import { linesPerClick } from './formulas'
import { investmentBonus } from './prestige'
import type { GameState } from './reducer'
import { contractScale } from './stages'
import { autoRate } from './team'

/**
 * Líneas por clic (sin crítico): habilidad + editor, × experiencia × IA asistida × Código heredado.
 * La experiencia crece con el tamaño de los proyectos (contractScale^0,5): así el clic sigue
 * importando en las etapas altas, cuando el equipo escribe miles de líneas por segundo (GDD §8).
 */
export function clickRate(state: GameState): number {
  const base = linesPerClick(state.skills.fastTyping, getEditor(state.editor).clickBonus)
  const seniority = Math.pow(contractScale(state.stage, state.endless), 0.5)
  return base * seniority * (1 + 0.1 * state.tech.ai) * investmentBonus(state.prestige.investments.legacyCode)
}

/** Líneas por segundo del equipo y el editor, × Trabajo en equipo × Git × Equipo experimentado */
export function autoRateOf(state: GameState): number {
  return (
    autoRate(state.team, getEditor(state.editor).autoBonus) *
    (1 + 0.05 * state.skills.teamwork) *
    (1 + 0.1 * state.tech.git) *
    investmentBonus(state.prestige.investments.seniorTeam)
  )
}
