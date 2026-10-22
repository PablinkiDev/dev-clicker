// Qué conviene hacer ahora: lo usa el panel de economía para mostrar "próximo paso" y "objetivo".
// Funciones puras: reciben el estado y devuelven textos y números, sin tocar React.
import { nextEditor } from '../data/editors'
import { OFFICES } from '../data/offices'
import { STAGES } from '../data/stages'
import { formatMoney } from './format'
import { milestoneValue, BASE_TOKENS, tokensForValue } from './prestige'
import type { GameState } from './reducer'
import { companyValue, isEndless, nextStageRequirements } from './stages'
import { employeePrice } from './team'

export type Purchase = { name: string; price: number }

/** La compra con dinero más barata que tenés pendiente: oficina, editor o un candidato */
export function nextPurchase(state: GameState): Purchase | null {
  const options: Purchase[] = []
  const office = OFFICES[state.office + 1]
  if (office && state.stage >= office.minStage) options.push({ name: office.name, price: office.price })
  const editor = nextEditor(state.editor)
  if (editor && state.stage >= (editor.minStage ?? 0)) options.push({ name: editor.name, price: editor.price })
  if (state.team.length < OFFICES[state.office].capacity && state.candidates.length) {
    const cheapest = Math.min(...state.candidates.map((c) => employeePrice(c.role, c.stars, state.stage)))
    options.push({ name: 'un empleado', price: cheapest })
  }
  return options.sort((a, b) => a.price - b.price)[0] ?? null
}

export type Goal = {
  title: string
  /** Detalle corto: lo que falta */
  detail: string
  /** De 0 a 1 */
  progress: number
  ready: boolean
}

/** El objetivo grande del momento: la próxima etapa o, en modo infinito, vender la empresa */
export function currentGoal(state: GameState): Goal {
  if (isEndless(state.stage)) {
    const value = companyValue(state.stats.moneyEarned, state.team)
    const tokens = tokensForValue(value)
    const from = tokens === BASE_TOKENS ? 0 : milestoneValue(tokens - BASE_TOKENS - 1)
    const to = milestoneValue(tokens - BASE_TOKENS)
    return {
      title: `💼 Vender la empresa · +${tokens} tokens`,
      detail: `valor ${formatMoney(value)} · +1 token a ${formatMoney(to)}`,
      progress: Math.min(1, (value - from) / (to - from)),
      ready: true,
    }
  }
  const next = STAGES[state.stage + 1]
  const reqs = nextStageRequirements(state) ?? []
  const missing = reqs.filter((r) => !r.done)
  return {
    title: missing.length ? `${next.icon} Ascender a ${next.name}` : `▲ ¡Podés ascender a ${next.name}!`,
    detail: missing.length
      ? missing.map((r) => `${r.label.toLowerCase()} ${r.progress}`).join(' · ')
      : 'tocá acá para ascender',
    progress: reqs.length ? reqs.reduce((sum, r) => sum + r.ratio, 0) / reqs.length : 1,
    ready: missing.length === 0,
  }
}
