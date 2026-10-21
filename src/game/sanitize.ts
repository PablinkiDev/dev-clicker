// Límites razonables para una partida cargada (de localStorage o de un archivo importado).
// La validación de save.ts revisa los TIPOS; acá se revisan los RANGOS: un número bien escrito
// pero absurdo (un dev de 50★, JavaScript Nv.99) se recorta al máximo posible en vez de romper el juego.
import { INVESTMENTS } from '../data/investments'
import { OFFICES } from '../data/offices'
import { SKILLS } from '../data/skills'
import { STAGES } from '../data/stages'
import { TECHS } from '../data/techs'
import type { GameState } from './reducer'
import type { Employee } from './team'

/** Recorta un número a [min, max]; si no es un número válido, devuelve min */
function clamp(value: number, min: number, max = Infinity): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

/** Niveles enteros entre 0 y el máximo de cada mejora */
function clampLevels<K extends string>(levels: Record<K, number>, items: { id: K; maxLevel: number }[]) {
  const result = { ...levels }
  for (const item of items) result[item.id] = Math.round(clamp(levels[item.id], 0, item.maxLevel))
  return result
}

const clampEmployee = (e: Employee): Employee => ({ ...e, stars: Math.round(clamp(e.stars, 1, 5)) })

export function sanitize(state: GameState): GameState {
  const office = Math.round(clamp(state.office, 0, OFFICES.length - 1))
  return {
    ...state,
    money: clamp(state.money, 0),
    xp: clamp(state.xp, 0),
    rep: clamp(state.rep, 0),
    code: clamp(state.code, 0),
    timeLeft: clamp(state.timeLeft, 0),
    stage: Math.round(clamp(state.stage, 0, STAGES.length - 1)),
    endless: Math.round(clamp(state.endless, 0)),
    office,
    skills: clampLevels(state.skills, SKILLS),
    tech: clampLevels(state.tech, TECHS),
    // Si hay más empleados de los que entran en la oficina, se quedan los primeros
    team: state.team.slice(0, OFFICES[office].capacity).map(clampEmployee),
    candidates: state.candidates.map(clampEmployee),
    stats: {
      moneyEarned: clamp(state.stats.moneyEarned, 0),
      contractsDone: Math.round(clamp(state.stats.contractsDone, 0)),
      contractsFailed: Math.round(clamp(state.stats.contractsFailed, 0)),
      playTime: clamp(state.stats.playTime, 0),
      xpEarned: clamp(state.stats.xpEarned, 0),
      specialsDone: Math.round(clamp(state.stats.specialsDone, 0)),
      badEvents: Math.round(clamp(state.stats.badEvents, 0)),
    },
    contractClicks: Math.round(clamp(state.contractClicks, 0)),
    records: {
      ...state.records,
      ...Object.fromEntries(
        (
          [
            'clicks',
            'crits',
            'lines',
            'contracts',
            'specials',
            'replacements',
            'betsWon',
            'bugs',
            'minigames',
            'goodStreak',
          ] as const
        ).map((key) => [key, clamp(state.records[key], 0)]),
      ),
    },
    prestige: {
      ...state.prestige,
      tokens: Math.round(clamp(state.prestige.tokens, 0)),
      sales: Math.round(clamp(state.prestige.sales, 0)),
      investments: clampLevels(state.prestige.investments, INVESTMENTS),
    },
  }
}
