// Producción del jugador con todos los bonus juntos. La usan el reducer y la interfaz,
// así los números que se ven son exactamente los que se aplican.
import { getEditor } from '../data/editors'
import { specialtyBonus } from '../data/techs'
import { linesPerClick } from './formulas'
import { modifierMultiplier } from './modifiers'
import { investmentBonus } from './prestige'
import { achievementMultiplier } from './records'
import type { GameState } from './reducer'
import { contractScale } from './stages'
import { autoRate } from './team'

/** Especialización en la tecnología del contrato en curso (1 si no hay contrato) */
function contractSpecialty(state: GameState): number {
  return state.contract ? specialtyBonus(state.tech, state.contract.lang) : 1
}

/**
 * Líneas por clic (sin crítico): habilidad + editor, × experiencia × IA asistida × Código heredado.
 * La experiencia crece con el tamaño de los proyectos (contractScale^0,5): así el clic sigue
 * importando en las etapas altas, cuando el equipo escribe miles de líneas por segundo (GDD §8).
 */
export function clickRate(state: GameState, now?: number): number {
  const base = linesPerClick(state.skills.fastTyping, getEditor(state.editor).clickBonus)
  const seniority = Math.pow(contractScale(state.stage, state.endless), 0.5)
  // Memoria muscular: cada clic suma una parte de lo que produce el equipo por segundo
  const muscle = 0.01 * state.skills.muscleMemory * autoRateOf(state, now)
  return (
    muscle +
    base *
      (1 + 0.1 * state.skills.shortcuts) *
      seniority *
      contractSpecialty(state) *
      modifierMultiplier(state.modifiers, 'click', now) *
      (1 + 0.1 * state.tech.ai) *
      investmentBonus(state.prestige.investments.legacyCode) *
      achievementMultiplier(state.records)
  )
}

/** Multiplicador de los críticos: el del editor + 0,5 por nivel de Crítico devastador */
export function critMultiplier(state: GameState): number {
  return getEditor(state.editor).critMultiplier + 0.5 * state.skills.devastatingCrit
}

/**
 * Líneas por segundo del equipo y el editor, × Trabajo en equipo × Git × Equipo experimentado.
 * now: la hora, para los modificadores temporales (bug dorado, eventos). Sin hora no se cuentan
 */
export function autoRateOf(state: GameState, now?: number): number {
  // Contrato especial "Solo a mano": el equipo no puede tocarlo
  if (state.contract?.special === 'clicksOnly') return 0
  return (
    modifierMultiplier(state.modifiers, 'auto', now) *
    autoRate(state.team, getEditor(state.editor).autoBonus) *
    contractSpecialty(state) *
    (1 + 0.05 * state.skills.teamwork) *
    (1 + 0.1 * state.tech.git) *
    investmentBonus(state.prestige.investments.seniorTeam) *
    achievementMultiplier(state.records)
  )
}
