// Con qué se generan las ofertas nuevas. Lo usan la interfaz y la simulación, para que den lo mismo.
import { getChallenge } from '../data/challenges'
import { bonuses } from './cards'
import type { OfferContext } from './offers'
import { autoRateOf, clickRate, macroRateOf } from './rates'
import type { GameState } from './reducer'
import { pmMultiplier } from './team'

/** Líneas por segundo con unos clics por segundo dados (clics + macro + equipo) */
const perSecondOf = (state: GameState, clicksPerSecond: number, now?: number) =>
  (clicksPerSecond + macroRateOf(state)) * clickRate(state) + autoRateOf(state, now)

/**
 * 🏁 Los contratos se dimensionan como si NO hubiera desafío: si no, al bajar tu producción también
 * bajaría el código que piden y el desafío se anularía solo. El plazo del desafío se aplica después.
 */
export function offerContextOf(state: GameState, clicksPerSecond: number, now?: number): OfferContext {
  const neutral: GameState = { ...state, challenge: null }
  const effects = bonuses(neutral)
  return {
    tech: state.tech,
    stage: state.stage,
    endless: state.endless,
    rep: state.rep,
    perSecond: perSecondOf(state, clicksPerSecond, now),
    sizingPerSecond: perSecondOf(neutral, clicksPerSecond, now),
    timeBonus: (1 + 0.08 * state.skills.timeManagement) * effects.timeMult,
    // El 📋 PM da más plazo sin agrandar el código: el contrato queda más holgado
    extraTime: (getChallenge(state.challenge)?.effects?.timeMult ?? 1) * pmMultiplier(state.team),
    codeMult: effects.codeMult,
    specialMult: effects.specialMult,
  }
}
