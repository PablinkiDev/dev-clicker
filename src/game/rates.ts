// Producción del jugador con todos los bonus juntos. La usan el reducer y la interfaz,
// así los números que se ven son exactamente los que se aplican.
import { getEditor } from '../data/editors'
import { specialtyBonus } from '../data/techs'
import { COMBO_BONUS, COMBO_STEP, IDLE_SECONDS } from '../data/cards'
import { macroCps } from '../data/macro'
import { bonuses } from './cards'
import { isFocused } from './focus'
import { critChance, linesPerClick } from './formulas'
import { modifierMultiplier } from './modifiers'
import { founderBonus, investmentBonus } from './prestige'
import { achievementMultiplier } from './records'
import type { GameState } from './reducer'
import { contractScale } from './stages'
import { autoRate, dataLuck } from './team'

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
  const cards = bonuses(state)
  return (
    muscle +
    base *
      (1 + 0.1 * state.skills.shortcuts) *
      seniority *
      contractSpecialty(state) *
      modifierMultiplier(state.modifiers, 'click', now) *
      (1 + 0.1 * state.tech.ai) *
      investmentBonus(state.prestige.investments.legacyCode) *
      founderBonus(state.prestige) *
      achievementMultiplier(state.records) *
      cards.clickMult *
      (1 + comboBonus(state, cards.comboMax, now))
  )
}

/** 🃏 Combo: cada COMBO_STEP clics seguidos suma COMBO_BONUS, hasta el máximo de la carta (0 si se cortó) */
export function comboBonus(state: GameState, max: number, now?: number): number {
  if (max === 0 || now === undefined || now - state.combo.lastAt > 1000) return 0
  return Math.min(max, COMBO_BONUS * Math.floor(state.combo.count / COMBO_STEP))
}

/** Probabilidad de crítico: habilidad + editor + cartas */
export function critChanceOf(state: GameState): number {
  return critChance(state.skills.criticalCode, getEditor(state.editor).critBonus) + bonuses(state).critChance
}

/** Clics por segundo de la Macro de teclado (con las cartas), 0 si no la tenés o está apagada */
export function macroRateOf(state: GameState): number {
  return state.macroOn && state.macro > 0 ? macroCps(state.macro) + bonuses(state).macroCps : 0
}

/** Cuánto crece el equipo con la etapa: contractScale ^ esto (el clic usa 0,5) */
export const TEAM_SENIORITY = 0.7

/** Multiplicador de los críticos: el del editor + 0,5 por nivel de Crítico devastador */
export function critMultiplier(state: GameState): number {
  return getEditor(state.editor).critMultiplier + 0.5 * state.skills.devastatingCrit + bonuses(state).critExtra
}

/**
 * Líneas por segundo del equipo y el editor, × Trabajo en equipo × Git × Equipo experimentado.
 * now: la hora, para los modificadores temporales (bug dorado, eventos). Sin hora no se cuentan
 */
export function autoRateOf(state: GameState, now?: number): number {
  // Contrato especial "Solo a mano": el equipo no puede tocarlo
  if (state.contract?.special === 'clicksOnly') return 0
  // El equipo también gana experiencia con proyectos más grandes (un poco más rápido que el clic):
  // así en las etapas altas la automatización pesa más y el jugador tranquilo no se queda atrás
  const seniority = Math.pow(contractScale(state.stage, state.endless), TEAM_SENIORITY)
  const cards = bonuses(state)
  // Cartas que dependen del momento: Café para todos (con el Foco activo) y Horas extra (sin clics hace rato)
  const focusTeam = now !== undefined && isFocused(state.focus, now) ? cards.focusTeamMult : 1
  const idle = now !== undefined && now - state.combo.lastAt > IDLE_SECONDS * 1000 ? cards.idleMult : 1
  return (
    seniority *
    cards.autoMult *
    focusTeam *
    idle *
    modifierMultiplier(state.modifiers, 'auto', now) *
    autoRate(state.team, getEditor(state.editor).autoBonus, state.skills.kubernetes) *
    contractSpecialty(state) *
    (1 + 0.05 * state.skills.teamwork) *
    (1 + 0.1 * state.tech.git) *
    investmentBonus(state.prestige.investments.seniorTeam) *
    founderBonus(state.prestige) *
    achievementMultiplier(state.records)
  )
}

/** 🍀 Suerte en eventos y apuestas: habilidad Suerte + cartas y artefactos + 📊 Data Scientists */
export function luckOf(state: GameState): number {
  return state.skills.lucky + bonuses(state).luck + dataLuck(state.team)
}
