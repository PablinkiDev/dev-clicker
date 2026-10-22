// Tests del reducer (C12): las reglas del juego que no se pueden romper sin darnos cuenta.
import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer, type GameAction, type GameState } from './reducer'
import { autoRate, candidateRoles, createCandidate, devRate } from './team'
import { EVENTS, canHappen } from '../data/events'
import { getBoss } from '../data/bosses'
import { createBossOffer } from './offers'
import { ACHIEVEMENTS } from '../data/achievements'
import {
  DEFAULT_COMPANY,
  DEFAULT_PROFILE,
  FACE_ITEMS,
  HEAD_ITEMS,
  HOODIES,
  TITLES,
} from '../data/personalization'

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

describe('desafíos de run', () => {
  const sellable = (challenge: string | null): GameState => {
    const s = createInitialState()
    return { ...s, stage: 4, stats: { ...s.stats, moneyEarned: 7e9 }, challenge }
  }
  const sell = (s: GameState) => gameReducer(s, { type: 'sell', fresh: createInitialState(), now: 1 })

  it('después de vender, la empresa nueva pregunta por un desafío', () => {
    const after = sell(sellable(null))
    expect(after.challengeChoice).toBe(true)
    const chosen = gameReducer(after, { type: 'setChallenge', id: 'sleepyTeam' })
    expect(chosen.challenge).toBe('sleepyTeam')
    expect(chosen.challengeChoice).toBe(false)
  })

  it('sin la pregunta pendiente no se puede elegir', () => {
    const s = createInitialState()
    expect(gameReducer(s, { type: 'setChallenge', id: 'sleepyTeam' })).toBe(s)
  })

  it('vender con desafío da más tokens y cajas extra la primera vez', () => {
    const normal = sell(sellable(null))
    const challenged = sell(sellable('tiedHands'))
    expect(challenged.prestige.tokens).toBeGreaterThan(normal.prestige.tokens)
    expect(challenged.records.boxes).toBe(normal.records.boxes + 2)
    expect(challenged.records.challengesDone).toEqual(['tiedHands'])
  })

  it('Nano para siempre no deja comprar editores', () => {
    const s = { ...createInitialState(), money: 1e6, challenge: 'nanoForever' }
    expect(gameReducer(s, { type: 'buyEditor' })).toBe(s)
  })

  it('Equipo con sueño baja la producción del equipo', async () => {
    const { autoRateOf } = await import('./rates')
    const s = { ...createInitialState(), team: [createCandidate('dev', [], 0, 3)] }
    expect(autoRateOf({ ...s, challenge: 'sleepyTeam' }, 0)).toBeCloseTo(autoRateOf(s, 0) * 0.5)
  })
})

describe('salida a la bolsa (IPO)', () => {
  it('pide 12 ventas', () => {
    const s = createInitialState()
    const eleven = { ...s, prestige: { ...s.prestige, sales: 11 } }
    expect(gameReducer(eleven, { type: 'ipo', now: 5 })).toBe(eleven)
  })

  it('con 12 ventas se sale a la bolsa una sola vez y da el logro', () => {
    const s0 = createInitialState()
    const s = gameReducer({ ...s0, prestige: { ...s0.prestige, sales: 12 } }, { type: 'ipo', now: 5 })
    expect(s.records.ipoAt).toBe(5)
    expect(s.records.unlocked).toContain('ipo')
    expect(gameReducer(s, { type: 'ipo', now: 9 })).toBe(s)
  })
})

describe('profesiones (G1)', () => {
  it('el Diseñador UX sube la paga', () => {
    const s = withContract()
    const full = { ...s, contract: { ...s.contract!, reward: { ...s.contract!.reward, money: 10_000 } }, code: 1e9 }
    const normal = gameReducer(full, { type: 'deliver' }).money
    const withUx = gameReducer({ ...full, team: [createCandidate('ux', [], 1, 5)] }, { type: 'deliver' }).money
    expect(withUx).toBe(Math.round((normal * 1.3) / 5) * 5)
  })

  it('el Tech Lead potencia a los demás', () => {
    const dev = createCandidate('dev', [], 0, 3)
    const lead = createCandidate('lead', [dev], 3, 4)
    expect(autoRate([dev, lead], 0)).toBeCloseTo(devRate(3) * 1.12)
  })

  it('el pasante suma o resta código sin pasarse', () => {
    const intern = createCandidate('intern', [], 0, 5)
    const s = { ...withContract(), team: [intern] }
    const plus = gameReducer(s, { type: 'intern', uid: intern.uid, surprise: true })
    expect(plus.code).toBeGreaterThan(0)
    expect(gameReducer(s, { type: 'intern', uid: intern.uid, surprise: false }).code).toBe(0)
    expect(gameReducer({ ...s, contract: null }, { type: 'intern', uid: intern.uid, surprise: true }).code).toBe(0)
  })

  it('hay un candidato por profesión de la etapa', () => {
    expect(candidateRoles(0)).toEqual(['dev', 'qa', 'ops', 'intern', 'dev'])
    expect(candidateRoles(3)).toHaveLength(8)
  })
})

describe('variedad (G3)', () => {
  it('los eventos de profesiones y artefactos solo salen si los tenés', () => {
    const intern = EVENTS.find((e) => e.id === 'pasante-medialunas')!
    const duck = EVENTS.find((e) => e.id === 'patito-habla')!
    const ctx = { hasContract: true, roles: [], artifacts: [], features: [] }
    expect(canHappen(intern, ctx)).toBe(false)
    expect(canHappen(intern, { ...ctx, roles: ['intern'] })).toBe(true)
    expect(canHappen(duck, { ...ctx, artifacts: ['rubberDuck'] })).toBe(true)
    expect(canHappen(duck, { ...ctx, hasContract: false, artifacts: ['rubberDuck'] })).toBe(false)
  })

  it('el regalo del proveedor da una caja', () => {
    const gift = EVENTS.find((e) => e.id === 'regalo-proveedor')!
    const s = gameReducer(createInitialState(), {
      type: 'applyEvent',
      text: '',
      icon: gift.icon,
      effects: gift.effects!,
      now: 0,
    })
    expect(s.records.boxes).toBe(1)
  })

  it('los jefes tienen su propio pedido', () => {
    const offer = createBossOffer({ tech: createInitialState().tech, stage: 1, endless: 0, rep: 0, perSecond: 10 })!
    expect(offer.title).toBe(getBoss(offer.boss!)!.title)
  })
})

describe('personalización (G4)', () => {
  it('el nombre se recorta y lo que no existe vuelve a lo de siempre', () => {
    const s = gameReducer(createInitialState(), {
      type: 'setCompany',
      company: { name: '   Una empresa con un nombre larguísimo   ', emoji: '<script>', color: 'fucsia' },
    })
    expect(s.company.name).toBe('Una empresa con un nombr')
    expect(s.company.emoji).toBe(DEFAULT_COMPANY.emoji)
    expect(s.company.color).toBe(DEFAULT_COMPANY.color)
  })

  it('los accesorios bloqueados no se pueden poner', () => {
    const base = createInitialState()
    expect(gameReducer(base, { type: 'setProfile', profile: { head: 'crown' } }).profile.head).toBe('none')
    const legend = { ...base, records: { ...base.records, unlocked: ['ipo'] } }
    expect(gameReducer(legend, { type: 'setProfile', profile: { head: 'crown' } }).profile.head).toBe('crown')
  })

  it('al vender se guarda el nombre y el perfil sigue', () => {
    const s = {
      ...createInitialState(),
      stage: 4,
      company: { name: 'Bugs & Cía.', emoji: '🐙', color: 'red' },
      profile: { ...DEFAULT_PROFILE, mascot: 'cat' as const },
    }
    const after = gameReducer(s, { type: 'sell', fresh: createInitialState(), now: 1 })
    expect(after.prestige.history[0].company?.name).toBe('Bugs & Cía.')
    expect(after.profile.mascot).toBe('cat')
  })

  it('todo lo que se desbloquea apunta a un logro que existe', () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id))
    for (const choice of [...HOODIES, ...HEAD_ITEMS, ...FACE_ITEMS, ...TITLES])
      expect(!choice.unlock || ids.has(choice.unlock)).toBe(true)
  })
})
