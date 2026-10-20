// Progreso hacia la próxima etapa: funciones puras que leen el estado.
import { OFFICES } from '../data/offices'
import { STAGES } from '../data/stages'
import { formatMoney } from './format'
import type { GameState } from './reducer'
import { employeePrice, type Employee } from './team'

/** Cuánto crecen los contratos por cada contrato entregado en modo infinito (+8 %) */
export const ENDLESS_GROWTH: number = 1.08

export function isEndless(stage: number): boolean {
  return stage === STAGES.length - 1
}

/** Multiplicador de los contratos: el de la etapa y, en modo infinito, crece sin techo */
export function contractScale(stage: number, endless: number): number {
  const base = STAGES[stage].contractScale
  return isEndless(stage) ? base * Math.pow(ENDLESS_GROWTH, endless) : base
}

/**
 * Valor de la empresa: dinero ganado en toda la partida + lo que vale el equipo.
 * El dinero en mano no cuenta, así no conviene gastar y recomprar para inflarlo.
 */
export function companyValue(moneyEarned: number, team: Employee[]): number {
  return moneyEarned + team.reduce((total, e) => total + employeePrice(e.role, e.stars), 0)
}

export type Requirement = {
  label: string
  /** Texto del avance, por ejemplo "$4.000 / $12.000" */
  progress: string
  /** De 0 a 1, para la barra */
  ratio: number
  done: boolean
}

/** Requisitos de la próxima etapa con su avance; null si ya estás en la última */
export function nextStageRequirements(state: GameState): Requirement[] | null {
  const req = STAGES[state.stage + 1]?.requires
  if (!req) return null

  const item = (label: string, current: number, target: number, show: (n: number) => string = String): Requirement => ({
    label,
    progress: `${show(Math.min(current, target))} / ${show(target)}`,
    ratio: Math.min(1, current / target),
    done: current >= target,
  })

  return [
    item('Dinero ganado', state.stats.moneyEarned, req.moneyEarned, formatMoney),
    {
      label: 'Oficina',
      progress: OFFICES[req.office].name,
      ratio: state.office >= req.office ? 1 : 0,
      done: state.office >= req.office,
    },
    item('Empleados', state.team.length, req.team),
    item('Contratos entregados', state.stats.contractsDone, req.contractsDone),
  ]
}

export function canAscend(state: GameState): boolean {
  const reqs = nextStageRequirements(state)
  return reqs !== null && reqs.every((r) => r.done)
}
