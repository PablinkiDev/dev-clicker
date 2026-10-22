// Tests del reducer (C12): las reglas del juego que no se pueden romper sin darnos cuenta.
import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer, type GameAction, type GameState } from './reducer'
import { createCandidate } from './team'

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state)

/** Una partida con un contrato aceptado */
function withContract(): GameState {
  const s = createInitialState()
  const offer = s.offers[0]
  return gameReducer(s, { type: 'accept', offer, offers: s.offers.slice(1), cooldowns: {} })
}

describe('contratos', () => {
  it('programar suma código, clics y líneas', () => {
    const s = run(withContract(), { type: 'program', crit: false, now: 0 })
    expect(s.code).toBeGreaterThan(0)
    expect(s.records.clicks).toBe(1)
    expect(s.contractClicks).toBe(1)
  })

  it('entregar cobra y libera el editor', () => {
    let s = withContract()
    s = { ...s, code: s.contract!.code }
    const after = gameReducer(s, { type: 'deliver' })
    expect(after.contract).toBeNull()
    expect(after.money).toBeGreaterThan(0)
    expect(after.stats.contractsDone).toBe(1)
    expect(after.records.contracts).toBe(1)
  })

  it('no se puede entregar con el código incompleto', () => {
    const s = withContract()
    expect(gameReducer(s, { type: 'deliver' }).contract).not.toBeNull()
  })

  it('se vence el plazo: falla con pérdidas leves', () => {
    const s = { ...withContract(), money: 1000 }
    const after = gameReducer(s, { type: 'tick', elapsed: s.timeLeft + 1 })
    expect(after.contract).toBeNull()
    expect(after.stats.contractsFailed).toBe(1)
    expect(after.money).toBe(950) // −5 %
  })

  it('los clics de la macro escriben pero no cuentan como tuyos', () => {
    const s = run(withContract(), { type: 'program', crit: true, now: 0, macro: true })
    expect(s.code).toBeGreaterThan(0)
    expect(s.records.clicks).toBe(0)
    expect(s.records.crits).toBe(0)
  })
})

describe('equipo', () => {
  it('contratar cobra el precio y reinicia el reroll', () => {
    const s = { ...createInitialState(), money: 1e6, rerolls: 3 }
    const c = s.candidates[0]
    const after = gameReducer(s, { type: 'hire', uid: c.uid, candidates: s.candidates.slice(1) })
    expect(after.team).toHaveLength(1)
    expect(after.money).toBeLessThan(1e6)
    expect(after.rerolls).toBe(0)
  })

  it('buscar otros sale cada vez más caro', () => {
    let s = { ...createInitialState(), money: 1e6 }
    s = gameReducer(s, { type: 'rerollCandidates', candidates: s.candidates })
    const first = 1e6 - s.money
    const before = s.money
    s = gameReducer(s, { type: 'rerollCandidates', candidates: s.candidates })
    expect(before - s.money).toBeGreaterThan(first)
  })

  it('con la oficina llena no se contrata sin reemplazar', () => {
    const base = createInitialState()
    const team = [createCandidate('dev', [], 0, 1), createCandidate('dev', [], 0, 1)]
    const s = { ...base, money: 1e6, team }
    const c = s.candidates[0]
    expect(gameReducer(s, { type: 'hire', uid: c.uid, candidates: s.candidates }).team).toHaveLength(2)
  })
})

describe('vender la empresa', () => {
  function sellable(): GameState {
    const s = createInitialState()
    return {
      ...s,
      stage: 4,
      team: [createCandidate('qa', [], 4, 5), createCandidate('dev', [], 4, 5)],
      stats: { ...s.stats, moneyEarned: 7e9 },
      records: { ...s.records, unlocked: ['hello'] },
    }
  }

  it('reinicia la empresa pero conserva prestigio y logros', () => {
    const after = gameReducer(sellable(), { type: 'sell', fresh: createInitialState(), now: 1 })
    expect(after.stage).toBe(0)
    expect(after.prestige.sales).toBe(1)
    expect(after.prestige.tokens).toBeGreaterThanOrEqual(3)
    expect(after.records.unlocked).toContain('hello')
    expect(after.prestige.history).toHaveLength(1)
  })

  it('aplica las ventajas de arranque', () => {
    const s = sellable()
    const investments = { ...s.prestige.investments, portfolio: 1, license: 2, cofounder: 1, processes: 1 }
    const after = gameReducer(
      { ...s, prestige: { ...s.prestige, investments } },
      {
        type: 'sell',
        fresh: createInitialState(),
        now: 1,
      },
    )
    expect(after.tech.javascript).toBe(3)
    expect(after.editor).toBe('vscode')
    expect(after.team.map((e) => e.role)).toEqual(['dev']) // con empate de estrellas, el dev
    expect(after.skills.autoDeliver).toBe(1)
  })

  it('no se puede vender antes de Corporación', () => {
    const s = { ...sellable(), stage: 3 }
    expect(gameReducer(s, { type: 'sell', fresh: createInitialState(), now: 1 })).toBe(s)
  })

  it('la marca de partida editada sobrevive a la venta', () => {
    const after = gameReducer({ ...sellable(), tampered: true }, { type: 'sell', fresh: createInitialState(), now: 1 })
    expect(after.tampered).toBe(true)
  })
})

describe('logros', () => {
  it('el primer clic desbloquea "Hola mundo" una sola vez', () => {
    const s = run(withContract(), { type: 'program', crit: false, now: 0 }, { type: 'program', crit: false, now: 1 })
    expect(s.records.unlocked.filter((id) => id === 'hello')).toHaveLength(1)
  })

  it('una partida editada desbloquea el logro secreto', () => {
    const s = gameReducer({ ...createInitialState(), tampered: true }, { type: 'playTime', seconds: 1 })
    expect(s.records.unlocked).toContain('tampered')
  })
})
