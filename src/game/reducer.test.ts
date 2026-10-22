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

describe('revelado progresivo', () => {
  it('una partida nueva arranca sin nada revelado', () => {
    expect(createInitialState().records.features).toEqual([])
  })

  it('entregar el primer contrato revela Mejoras, una sola vez', () => {
    let s = withContract()
    s = gameReducer({ ...s, code: s.contract!.code }, { type: 'deliver' })
    expect(s.records.features).toEqual(['upgrades'])
    s = gameReducer(s, { type: 'playTime', seconds: 1 })
    expect(s.records.features.filter((id) => id === 'upgrades')).toHaveLength(1)
  })

  it('lo revelado sobrevive a la venta', () => {
    const s = createInitialState()
    const before = {
      ...s,
      stage: 4,
      stats: { ...s.stats, moneyEarned: 7e9 },
      records: { ...s.records, features: ['upgrades', 'team', 'prestige'] },
    }
    const after = gameReducer(before, { type: 'sell', fresh: createInitialState(), now: 1 })
    expect(after.records.features).toEqual(expect.arrayContaining(['upgrades', 'team', 'prestige']))
  })
})

describe('habilidades activas', () => {
  const learned = (s: GameState): GameState => ({
    ...s,
    skills: { ...s.skills, focus: 1, hackathon: 1, crunch: 1, pairProgramming: 1, doubleCoffee: 1 },
  })

  it('sin aprenderla no se puede usar', () => {
    const s = withContract()
    expect(gameReducer(s, { type: 'ability', id: 'hackathon', now: 0 })).toBe(s)
  })

  it('Hackatón multiplica los clics y queda en recarga', () => {
    const s = learned(withContract())
    const normal = gameReducer(s, { type: 'program', crit: false, now: 1000 }).code
    const boosted = run(s, { type: 'ability', id: 'hackathon', now: 0 }, { type: 'program', crit: false, now: 1000 })
    expect(boosted.code).toBeCloseTo(normal * 5)
    // En recarga: usarla de nuevo no hace nada
    expect(gameReducer(boosted, { type: 'ability', id: 'hackathon', now: 2000 })).toBe(boosted)
  })

  it('Crunch: el equipo rinde más y después se cansa', () => {
    const s = learned(withContract())
    const after = gameReducer(s, { type: 'ability', id: 'crunch', now: 0 })
    const peak = after.modifiers.find((m) => m.icon === '🔥')
    const tired = after.modifiers.find((m) => m.icon === '😴')
    expect(peak?.mult).toBe(3)
    expect(tired?.startsAt).toBe(peak?.endsAt)
    expect(tired!.mult).toBeLessThan(1)
  })

  it('Pair programming suma producción del equipo a cada clic', () => {
    const base = learned(withContract())
    const s = { ...base, team: [createCandidate('dev', [], 0, 3)] }
    const normal = gameReducer(s, { type: 'program', crit: false, now: 1000 }).code
    const paired = run(s, { type: 'ability', id: 'pair', now: 0 }, { type: 'program', crit: false, now: 1000 }).code
    expect(paired).toBeGreaterThan(normal)
  })

  it('Café doble recarga las demás habilidades y el Foco', () => {
    let s = learned(withContract())
    s = run(s, { type: 'focus', now: 0 }, { type: 'ability', id: 'hackathon', now: 0 })
    expect(s.abilities.hackathon.readyAt).toBeGreaterThan(60_000)
    s = gameReducer(s, { type: 'ability', id: 'coffee', now: 60_000 })
    expect(s.abilities.hackathon.readyAt).toBeLessThanOrEqual(60_000)
    expect(s.focus.readyAt).toBeLessThanOrEqual(60_000)
  })
})

describe('especializaciones (cartas)', () => {
  const offered = (s: GameState): GameState => ({
    ...s,
    cardOffer: [
      { id: 'pianist', rare: false },
      { id: 'scrum', rare: true },
      { id: 'loyalClient', rare: false },
    ],
  })

  it('elegir una carta la suma a la build y cierra la oferta', () => {
    const s = gameReducer(offered(withContract()), { type: 'pickCard', index: 1 })
    expect(s.cards).toEqual([{ id: 'scrum', rare: true }])
    expect(s.cardOffer).toBeNull()
  })

  it('Dedos de pianista multiplica los clics', () => {
    const s = withContract()
    const normal = gameReducer(s, { type: 'program', crit: false, now: 0 }).code
    const withCard = gameReducer(
      { ...s, cards: [{ id: 'pianist', rare: false }] },
      { type: 'program', crit: false, now: 0 },
    )
    expect(withCard.code).toBeCloseTo(normal * 1.5)
  })

  it('Cliente fiel sube la paga', () => {
    const base = withContract()
    // Un contrato que pague bastante, para que el redondeo a $5 no tape la diferencia
    const contract = { ...base.contract!, reward: { ...base.contract!.reward, money: 10_000 } }
    const full = { ...base, contract, code: contract.code }
    const normal = gameReducer(full, { type: 'deliver' }).money
    const withCard = gameReducer({ ...full, cards: [{ id: 'loyalClient', rare: true }] }, { type: 'deliver' }).money
    expect(withCard).toBeGreaterThan(normal * 1.25)
  })

  it('el combo crece con clics seguidos y se corta si parás', () => {
    const base = withContract()
    // Un contrato enorme, para que no se termine en el medio
    let s: GameState = { ...base, contract: { ...base.contract!, code: 1e6 }, cards: [{ id: 'combo', rare: false }] }
    for (let i = 0; i < 25; i++) s = gameReducer(s, { type: 'program', crit: false, now: 1000 + i * 100 })
    expect(s.combo.count).toBe(25)
    s = gameReducer(s, { type: 'program', crit: false, now: 10_000 })
    expect(s.combo.count).toBe(1)
  })

  it('las cartas se pierden al vender la empresa', () => {
    const base = createInitialState()
    const s = { ...base, stage: 4, stats: { ...base.stats, moneyEarned: 7e9 }, cards: [{ id: 'scrum', rare: false }] }
    expect(gameReducer(s, { type: 'sell', fresh: createInitialState(), now: 1 }).cards).toEqual([])
  })
})

describe('clientes jefe', () => {
  function bossOffer(base: GameState) {
    const offer = base.offers[0]
    return { ...offer, uid: 'jefe', boss: 'facebookAunt', reward: { ...offer.reward, money: 10_000 } }
  }

  it('cada contrato normal desde Estudio acerca al jefe', () => {
    const base = withContract()
    const s = { ...base, stage: 1, code: base.contract!.code }
    expect(gameReducer(s, { type: 'deliver' }).bossCountdown).toBe(s.bossCountdown - 1)
  })

  it('en Freelancer no hay jefes', () => {
    const s = createInitialState()
    expect(gameReducer(s, { type: 'spawnBoss', offer: bossOffer(s) })).toBe(s)
  })

  it('aparece en el tablón y reinicia la cuenta', () => {
    const s = { ...createInitialState(), stage: 1, bossCountdown: 0 }
    const after = gameReducer(s, { type: 'spawnBoss', offer: bossOffer(s) })
    expect(after.offers[0].boss).toBe('facebookAunt')
    expect(after.bossCountdown).toBe(10)
    // Nunca dos jefes a la vez
    expect(gameReducer(after, { type: 'spawnBoss', offer: bossOffer(s) })).toBe(after)
  })

  it('ganarle da una caja', () => {
    const s0 = { ...createInitialState(), stage: 1 }
    const offer = bossOffer(s0)
    let s = gameReducer(s0, { type: 'accept', offer, offers: s0.offers.slice(1), cooldowns: {} })
    s = gameReducer({ ...s, code: offer.code }, { type: 'deliver' })
    expect(s.records.bosses).toBe(1)
    expect(s.records.boxes).toBe(1)
  })

  it('perder contra un jefe no cobra multa', () => {
    const s0 = { ...createInitialState(), stage: 1, money: 1000 }
    const offer = bossOffer(s0)
    const s = gameReducer(s0, { type: 'accept', offer, offers: s0.offers.slice(1), cooldowns: {} })
    const after = gameReducer(s, { type: 'tick', elapsed: s.timeLeft + 1 })
    expect(after.contract).toBeNull()
    expect(after.money).toBe(1000)
  })
})

describe('artefactos y cajas', () => {
  const withBoxes = (boxes: number): GameState => {
    const s = createInitialState()
    return { ...s, records: { ...s.records, boxes } }
  }

  it('abrir una caja da el artefacto en Nv.1, y repetirlo lo sube', () => {
    let s = gameReducer(withBoxes(2), { type: 'openBox', artifact: 'keyboard' })
    expect(s.records.artifacts.keyboard).toBe(1)
    s = gameReducer(s, { type: 'openBox', artifact: 'keyboard' })
    expect(s.records.artifacts.keyboard).toBe(2)
    expect(s.records.boxes).toBe(0)
  })

  it('sin cajas no se abre nada', () => {
    const s = withBoxes(0)
    expect(gameReducer(s, { type: 'openBox', artifact: 'keyboard' })).toBe(s)
  })

  it('no pasa del nivel máximo', () => {
    const s0 = withBoxes(1)
    const s = { ...s0, records: { ...s0.records, artifacts: { keyboard: 10 } } }
    expect(gameReducer(s, { type: 'openBox', artifact: 'keyboard' })).toBe(s)
  })

  it('el teclado mecánico sube los clics', () => {
    const base = withContract()
    const normal = gameReducer(base, { type: 'program', crit: false, now: 0 }).code
    const s = { ...base, records: { ...base.records, artifacts: { keyboard: 5 } } }
    expect(gameReducer(s, { type: 'program', crit: false, now: 0 }).code).toBeCloseTo(normal * 1.4)
  })

  it('los artefactos y las cajas sobreviven a la venta, y cada venta da una caja', () => {
    const s0 = withBoxes(0)
    const s = {
      ...s0,
      stage: 4,
      stats: { ...s0.stats, moneyEarned: 7e9 },
      records: { ...s0.records, artifacts: { plant: 3 } },
    }
    const after = gameReducer(s, { type: 'sell', fresh: createInitialState(), now: 1 })
    expect(after.records.artifacts).toEqual({ plant: 3 })
    expect(after.records.boxes).toBe(1)
  })

  it('comprar una caja cuesta tokens y la próxima sale más cara', () => {
    const s0 = withBoxes(0)
    let s = { ...s0, prestige: { ...s0.prestige, tokens: 20 } }
    s = gameReducer(s, { type: 'buyBox' })
    expect(s.prestige.tokens).toBe(17)
    s = gameReducer(s, { type: 'buyBox' })
    expect(s.prestige.tokens).toBe(12) // 3 y después 5
    expect(s.records.boxes).toBe(2)
  })
})
