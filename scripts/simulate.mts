// Simulación de balance (backlog C3): un bot juega con el gameReducer real y mide cuánto tarda
// en llegar a cada hito. No toca el juego: solo despacha acciones, igual que la interfaz.
//
//   npx tsx scripts/simulate.mts            → 2 ciclos (hasta 2 ventas), 5 clics por segundo
//   npx tsx scripts/simulate.mts --cps 2    → jugador más tranquilo
//   npx tsx scripts/simulate.mts --cycles 1
import { nextEditor } from '../src/data/editors'
import { INVESTMENTS, investmentCost } from '../src/data/investments'
import { OFFICES } from '../src/data/offices'
import { SKILLS, missingSkillRequirements } from '../src/data/skills'
import { STAGES } from '../src/data/stages'
import { TECHS, missingRequirements } from '../src/data/techs'
import { formatDuration, formatMoney } from '../src/game/format'
import { critChance, skillCost } from '../src/game/formulas'
import { CLIENT_COOLDOWN_MS, refillOffers, type OfferContext } from '../src/game/offers'
import { tokensForValue } from '../src/game/prestige'
import { autoRateOf, clickRate } from '../src/game/rates'
import { createInitialState, gameReducer, type GameAction, type GameState } from '../src/game/reducer'
import { canAscend, companyValue, isEndless } from '../src/game/stages'
import { employeePrice, replaceCandidate, rerollCandidates } from '../src/game/team'
import { getEditor } from '../src/data/editors'

// --- Parámetros -------------------------------------------------------------------
const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? Number(process.argv[i + 1]) : fallback
}
const CLICKS_PER_SECOND = arg('cps', 5)
const CYCLES = arg('cycles', 2)
const STEP = 0.2 // segundos simulados por paso (como un tick de 200 ms)
const MAX_HOURS = 120 // corte de seguridad
/** Vende cuando la venta da al menos estos tokens (o tras 30 min en modo infinito) */
const SELL_AT_TOKENS = 4

// --- Estado de la simulación ----------------------------------------------------------
let state: GameState = createInitialState()
let clock = 0 // segundos simulados desde el inicio
let cycleStart = 0
let clickDebt = 0
let endlessSince: number | null = null
const events: string[] = []
const counters = { fails: 0, clicksLines: 0, autoLines: 0, focus: 0 }

const dispatch = (action: GameAction) => (state = gameReducer(state, action))
const nowMs = () => clock * 1000
const ctx = (s: GameState = state): OfferContext => ({
  tech: s.tech,
  stage: s.stage,
  endless: s.endless,
  rep: s.rep,
  perSecond: CLICKS_PER_SECOND * clickRate(s) + autoRateOf(s),
})
const log = (text: string) =>
  events.push(`${formatDuration(clock).padStart(11)}  (+${formatDuration(clock - cycleStart).padStart(10)})  ${text}`)

// --- Decisiones del bot -------------------------------------------------------------
function acceptBest() {
  const perSecond = CLICKS_PER_SECOND * clickRate(state) + autoRateOf(state)
  // La que mejor paga entre las que llega a hacer con margen; si ninguna, la más corta
  const viable = state.offers.filter((o) => o.code / perSecond <= o.time * 0.85)
  const pool = viable.length ? viable : [...state.offers].sort((a, b) => a.code / a.time - b.code / b.time).slice(0, 1)
  const offer = pool.reduce((best, o) => (o.reward.money > best.reward.money ? o : best))
  const cooldowns = { ...state.cooldowns, [offer.id]: nowMs() + CLIENT_COOLDOWN_MS }
  const remaining = state.offers.filter((o) => o.uid !== offer.uid)
  dispatch({ type: 'accept', offer, offers: refillOffers(remaining, cooldowns, offer.id, nowMs(), ctx()), cooldowns })
}

function shop() {
  if (canAscend(state)) {
    const offers = refillOffers([], state.cooldowns, state.contract?.id ?? null, nowMs(), {
      ...ctx(),
      stage: state.stage + 1,
    })
    dispatch({ type: 'ascend', offers, candidates: rerollCandidates(state.team, state.stage + 1) })
    log(`▲ Etapa ${state.stage + 1}: ${STAGES[state.stage].name}`)
  }

  // XP: siempre lo más barato que se pueda comprar (tecnologías y habilidades)
  for (;;) {
    const options = [
      ...TECHS.filter((t) => state.tech[t.id] < t.maxLevel && !missingRequirements(t, state.tech, state.stage)).map(
        (t) => ({
          cost: skillCost(t.baseCost, state.tech[t.id]),
          action: { type: 'learnTech', tech: t.id } as GameAction,
        }),
      ),
      ...SKILLS.filter(
        (sk) => state.skills[sk.id] < sk.maxLevel && !missingSkillRequirements(sk, state.skills, state.stage),
      ).map((sk) => ({
        cost: skillCost(sk.baseCost, state.skills[sk.id]),
        action: { type: 'buySkill', skill: sk.id } as GameAction,
      })),
    ].sort((a, b) => a.cost - b.cost)
    if (!options.length || options[0].cost > state.xp) break
    dispatch(options[0].action)
  }

  // Dinero: oficina si está llena, editor, contratar o reemplazar por alguien mucho mejor
  const office = OFFICES[state.office]
  const nextOffice = OFFICES[state.office + 1]
  if (
    nextOffice &&
    state.team.length >= office.capacity &&
    state.money >= nextOffice.price &&
    state.stage >= nextOffice.minStage
  ) {
    dispatch({ type: 'moveOffice' })
    log(`📦 Mudanza a ${OFFICES[state.office].name}`)
  }
  const editor = nextEditor(state.editor)
  if (editor && state.money >= editor.price * 1.5) {
    dispatch({ type: 'buyEditor' })
    log(`🛠  Editor: ${editor.name}`)
  }
  // Sin devs no hay producción: el primero siempre es un dev; después, el de más estrellas
  const hasDev = state.team.some((e) => e.role === 'dev')
  const best = [...state.candidates].sort(
    (a, b) => Number(!hasDev && b.role === 'dev') - Number(!hasDev && a.role === 'dev') || b.stars - a.stars,
  )[0]
  if (best) {
    const price = employeePrice(best.role, best.stars)
    const candidates = replaceCandidate(state.candidates, best, state.team, state.stage)
    if (state.team.length < OFFICES[state.office].capacity) {
      if (state.money >= price) {
        dispatch({ type: 'hire', uid: best.uid, candidates })
        if (state.team.length === 1) log(`👤 Primer empleado (${best.role} ${best.stars}★)`)
      }
    } else {
      const worst = [...state.team].sort((a, b) => a.stars - b.stars)[0]
      if (best.stars >= worst.stars + 2 && state.money >= price * 2) {
        dispatch({ type: 'hire', uid: best.uid, replaceUid: worst.uid, candidates })
      }
    }
  }
  if (state.skills.focus > 0 && nowMs() >= state.focus.readyAt) {
    dispatch({ type: 'focus', now: nowMs() })
    counters.focus++
  }
}

function sellIfReady(): boolean {
  if (!isEndless(state.stage)) return false
  endlessSince ??= clock
  const value = companyValue(state.stats.moneyEarned, state.team)
  if (tokensForValue(value) < SELL_AT_TOKENS && clock - endlessSince < 30 * 60) return false
  dispatch({ type: 'sell', fresh: createInitialState(), now: nowMs() })
  log(`💼 VENTA por ${formatMoney(value)} → +${tokensForValue(value)} tokens`)
  // Gastar tokens: lo más barato que se pueda
  for (;;) {
    const options = INVESTMENTS.filter(
      (i) =>
        state.prestige.investments[i.id] < i.maxLevel && (!i.requires || state.prestige.investments[i.requires] > 0),
    ).sort(
      (a, b) => investmentCost(state.prestige.investments[a.id]) - investmentCost(state.prestige.investments[b.id]),
    )
    if (!options.length || investmentCost(state.prestige.investments[options[0].id]) > state.prestige.tokens) break
    dispatch({ type: 'invest', investment: options[0].id })
  }
  endlessSince = null
  return true
}

// --- Bucle principal ------------------------------------------------------------------
console.log(`Simulando: ${CLICKS_PER_SECOND} clics/s, hasta ${CYCLES} venta(s)...\n`)
let sales = 0
let nextShop = 0
while (clock < MAX_HOURS * 3600 && sales < CYCLES) {
  if (!state.contract) acceptBest()

  // Clics (con crítico y Concentración, como en App)
  clickDebt += CLICKS_PER_SECOND * STEP
  while (clickDebt >= 1 && state.contract && state.code < state.contract.code) {
    clickDebt -= 1
    const before = state.code
    const crit = Math.random() < critChance(state.skills.criticalCode, getEditor(state.editor).critBonus)
    dispatch({ type: 'program', crit, now: nowMs() })
    // Si el clic completó y se entregó solo (Entrega continua), el código vuelve a 0: se cuenta lo que faltaba
    counters.clicksLines += state.code >= before ? state.code - before : 0
  }
  if (!state.contract || state.code >= state.contract.code) clickDebt = 0

  // El tiempo corre
  const before = state.code
  const failsBefore = state.stats.contractsFailed
  dispatch({ type: 'tick', elapsed: STEP })
  if (state.contract) counters.autoLines += Math.max(0, state.code - before)
  if (state.stats.contractsFailed > failsBefore) counters.fails++
  if (state.contract && state.code >= state.contract.code) dispatch({ type: 'deliver' })
  clock += STEP

  if (process.argv.includes('--debug') && Math.abs(clock - 60) < STEP / 2)
    console.log('t=60s', Math.round(state.money), state.stats.moneyEarned, state.stats.contractsDone)
  if (clock >= nextShop) {
    nextShop = clock + 1
    shop()
    if (sellIfReady()) {
      sales++
      cycleStart = clock
    }
  }
}

// --- Reporte -------------------------------------------------------------------------
console.log('  tiempo total  (del ciclo)    evento')
for (const e of events) console.log(e)
const total = counters.clicksLines + counters.autoLines
console.log(`\nContratos vencidos: ${counters.fails}`)
console.log(
  `Líneas por clic: ${Math.round((counters.clicksLines / total) * 100)}% · automáticas: ${Math.round((counters.autoLines / total) * 100)}%`,
)
console.log(`Tiempo total simulado: ${formatDuration(clock)}`)
console.log(`Concentración usada: ${counters.focus} veces`)
console.log(`Logros: ${state.records.unlocked.length} → ${state.records.unlocked.join(', ')}`)
