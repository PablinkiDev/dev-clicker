// Todo el estado del juego y las reglas que lo cambian.
// El reducer es una función pura: (estado, acción) → estado nuevo. No usa React,
// no lee la hora ni números al azar: eso llega desde afuera, dentro de las acciones.
import {
  DEFAULT_PROFILE,
  cleanCompany,
  cleanProfile,
  randomCompany,
  type CompanyIdentity,
  type Profile,
} from '../data/personalization'
import { FAILURE_REP_LOSS, addCode, failureMoneyLoss, failureXp, skillCost, xpMultiplier } from './formulas'
import { INITIAL_SKILLS, SKILLS, missingSkillRequirements, type SkillId, type SkillLevels } from '../data/skills'
import { EDITORS, nextEditor, type EditorId } from '../data/editors'
import { INITIAL_TECH, LANG_TECH, TECHS, missingRequirements, type TechId, type TechLevels } from '../data/techs'
import { OFFICES, officeCapacity } from '../data/offices'
import { formatMoney, formatNumber, formatRate } from './format'
import { STAGES } from '../data/stages'
import { canAscend, companyValue, isEndless } from './stages'
import { INITIAL_PRESTIGE, IPO_SALES, investmentBonus, tokensForValue, type Prestige } from './prestige'
import { FIRST_CONTACTS_REP, INVESTMENTS, SEED_CAPITAL, investmentCost, type InvestmentId } from '../data/investments'
import { autoRateOf, clickRate, critMultiplier } from './rates'
import { BUG_DURATION, BUG_MULTIPLIER } from './bug'
import { activeModifiers, type Modifier } from './modifiers'
import type { Effect } from '../data/events'
import { FOCUS_COOLDOWN, INITIAL_FOCUS, focusDuration, focusMultiplier, isFocused, type Focus } from './focus'
import { createInitialOffers, type Cooldowns } from './offers'
import {
  createInitialCandidates,
  rerollPrice,
  employeeEffect,
  employeePrice,
  internSwing,
  qaMultiplier,
  uxMultiplier,
  type Employee,
} from './team'
import type { Contract } from './types'
import { INITIAL_RECORDS, type Records } from './records'
import { INITIAL_INBOX, notify, type Inbox } from './inbox'
import { SEEN_LIMIT, allAvailable } from './news'
import { ACHIEVEMENTS } from '../data/achievements'
import { FEATURES } from '../data/features'
import { getCard, type CardPick } from '../data/cards'
import { BOSS_EVERY, getBoss } from '../data/bosses'
import { MAX_ARTIFACT_LEVEL, boxPrice, getArtifact } from '../data/artifacts'
import { CHALLENGE_FIRST_BOXES, getChallenge } from '../data/challenges'
import { bonuses } from './cards'
import { MINIGAME_REWARD_SECONDS, minigameReward } from '../data/minigames'
import { MACRO_LEVELS } from '../data/macro'
import {
  ABILITIES,
  CRUNCH_MULT,
  CRUNCH_SECONDS,
  HACKATHON_MULT,
  INITIAL_ABILITIES,
  crunchTired,
  pairSeconds,
  type AbilityId,
  type AbilityTimers,
} from '../data/abilities'

/** Mensaje que se muestra después de entregar o fallar un contrato */
export type Notice = {
  kind: 'success' | 'error'
  text: string
}

/** Una línea de la terminal del juego */
export type LogEntry = {
  id: number
  kind: 'info' | 'success' | 'error' | 'crit'
  text: string
}

/** Números de toda la partida: los usan los ascensos, el valor de la empresa y el historial */
export type Stats = {
  /** Dinero ganado con contratos (no baja al gastar) */
  moneyEarned: number
  contractsDone: number
  contractsFailed: number
  /** Segundos jugados con la pestaña visible */
  playTime: number
  /** XP ganada con contratos (no baja al gastar): para medir cuánto ganás por minuto */
  xpEarned: number
  /** Contratos especiales (dorados) entregados */
  specialsDone: number
  /** Eventos malos que te tocaron en esta empresa */
  badEvents: number
}

export const INITIAL_STATS: Stats = {
  moneyEarned: 0,
  contractsDone: 0,
  contractsFailed: 0,
  playTime: 0,
  xpEarned: 0,
  specialsDone: 0,
  badEvents: 0,
}

/** Inversores: interés por minuto, por nivel */
const INTEREST_PER_MINUTE = 0.005

/** Precio del modo oscuro (un chiste del juego; la accesibilidad es gratis) */
export const DARK_MODE_PRICE = 60

/** Cuántas líneas guarda la terminal */
const LOG_LIMIT = 50

export type GameState = {
  code: number
  money: number
  xp: number
  rep: number
  skills: SkillLevels
  /** Nivel de cada tecnología (0 = no aprendida) */
  tech: TechLevels
  /** El mejor editor comprado: define los bonus */
  editor: EditorId
  /** El editor que se ve (solo estético; cualquiera ya comprado) */
  look: EditorId
  /** Modo oscuro para Bloc de notas y Notepad: se compra una vez y después se prende o apaga */
  darkMode: { owned: boolean; on: boolean }
  /** Accesibilidad: fuerza colores oscuros en los editores claros. Siempre gratis */
  dim: boolean
  /** Interruptor de la Captación automática (sirve solo si la mejora está comprada) */
  autoAccept: boolean
  /** Concentración: cuándo termina y cuándo se recarga */
  focus: Focus
  /** ⚡ Habilidades activas (F2): cuándo termina cada una y cuándo se recarga */
  abilities: AbilityTimers
  /** 🃏 Especializaciones elegidas en esta empresa (F1): se pierden al venderla */
  cards: CardPick[]
  /** Cartas ofrecidas al ascender, esperando que elijas una (null si no hay nada pendiente) */
  cardOffer: CardPick[] | null
  /** 🏁 Desafío de esta empresa (F5): id en data/challenges.ts, o null */
  challenge: string | null
  /** Al empezar una empresa nueva después de vender: falta elegir desafío (o ninguno) */
  challengeChoice: boolean
  /** 👹 Contratos que faltan para que aparezca el próximo cliente jefe (desde Estudio) */
  bossCountdown: number
  /** Clics seguidos (para el Combo) y hora del último clic tuyo (para las Horas extra) */
  combo: { count: number; lastAt: number }
  /** Multiplicadores temporales activos: el 🐛 bug dorado y los eventos */
  modifiers: Modifier[]
  /** Empleados contratados (sin contarte a vos) */
  team: Employee[]
  /** Candidatos que se pueden contratar */
  candidates: Employee[]
  /** Índice de la etapa actual en STAGES */
  stage: number
  /** Contratos entregados en modo infinito (después de Corporación) */
  endless: number
  /** Índice de la oficina actual en OFFICES */
  office: number
  offers: Contract[]
  cooldowns: Cooldowns
  /** Contrato en curso; null si no hay ninguno aceptado */
  contract: Contract | null
  timeLeft: number
  notice: Notice | null
  stats: Stats
  /** Lo único que sobrevive a vender la empresa (junto con los récords) */
  prestige: Prestige
  /** Contadores de toda la carrera y logros: no se pierden al vender */
  records: Records
  /** Clics hechos en el contrato en curso */
  contractClicks: number
  /** Búsquedas de candidatos seguidas sin contratar (cada una sale más cara) */
  rerolls: number
  /** La partida se editó a mano (firma inválida): se marca para siempre, nunca se borra */
  tampered: boolean
  /** 🏢 Nombre y logo de esta empresa (G4): se elige con cada empresa nueva */
  company: CompanyIdentity
  /** 🧑‍💻 Tu avatar, título y mascota (G4): son tuyos, sobreviven a las ventas */
  profile: Profile
  /** 🔔 Centro de notificaciones (H2): lo que pasó, para no perderse nada */
  inbox: Inbox
  /** 🤖 Macro de teclado: nivel comprado (0 = no) y si está prendida */
  macro: number
  macroOn: boolean
  /** Terminal: lo que fue pasando. No se guarda en localStorage */
  log: LogEntry[]
}

/** Agrega una línea a la terminal (devuelve una lista nueva; nunca muta la anterior) */
function addLog(log: LogEntry[], kind: LogEntry['kind'], text: string): LogEntry[] {
  const id = (log.at(-1)?.id ?? 0) + 1
  return [...log, { id, kind, text }].slice(-LOG_LIMIT)
}

/** Todo lo que puede pasar en el juego. Cada acción describe QUÉ pasó, no cómo cambia el estado */
export type GameAction =
  // Si el clic fue crítico se decide afuera (es azar) con la probabilidad de critChance()
  // now: para saber si la Concentración sigue activa (la hora llega de afuera, el reducer es puro)
  // macro: lo hizo la 🤖 Macro de teclado (no es crítico ni cuenta para tus logros)
  | { type: 'program'; crit: boolean; now: number; macro?: boolean }
  | { type: 'buyMacro' }
  | { type: 'setMacro'; on: boolean }
  | { type: 'focus'; now: number }
  | { type: 'ability'; id: AbilityId; now: number }
  | { type: 'deliver' }
  // now: la hora, para el 🐛 bug dorado (opcional: la simulación no lo usa)
  | { type: 'tick'; elapsed: number; now?: number }
  // fast: si se atrapó en sus primeros 2 segundos
  | { type: 'catchBug'; now: number; fast?: boolean }
  /** 🎓 Un pasante hizo algo: sorprendió (suma código) o metió un bug (resta). El azar va afuera */
  | { type: 'intern'; uid: string; surprise: boolean }
  // Un evento al azar ya resuelto (si tenía azar u opciones, se resolvió afuera)
  // tone: para las rachas · bet: si era una opción con azar, si salió bien
  | {
      type: 'applyEvent'
      text: string
      icon: string
      effects: Effect[]
      now: number
      candidates?: Employee[]
      tone?: 'good' | 'bad' | 'choice'
      bet?: 'won' | 'lost'
    }
  // Un minijuego terminado (D9): score de 0 a 1
  | { type: 'minigame'; score: number; now: number }
  | { type: 'buySkill'; skill: SkillId }
  | { type: 'learnTech'; tech: TechId }
  // Los candidatos nuevos se generan afuera (usan azar) y llegan ya calculados
  // replaceUid: a quién se despide para hacer lugar si la oficina está llena (no se recupera el dinero)
  | { type: 'hire'; uid: string; replaceUid?: string; candidates: Employee[] }
  | { type: 'rerollCandidates'; candidates: Employee[] }
  | { type: 'moveOffice' }
  // Al ascender se arma un tablón nuevo con contratos de la etapa nueva (usa azar: llega calculado),
  // y se ofrecen 3 cartas de especialización (también al azar)
  | { type: 'ascend'; offers: Contract[]; candidates: Employee[]; cardOffer: CardPick[] }
  | { type: 'pickCard'; index: number }
  /** 🎨 Personalización (G4): se limpia en el reducer (nombre corto, opciones que existen y desbloqueadas) */
  | { type: 'setCompany'; company: CompanyIdentity }
  | { type: 'setProfile'; profile: Partial<Profile> }
  /** 🐈 Acariciaste a la mascota */
  | { type: 'pet' }
  /** 🔔 Abriste el centro de notificaciones: todo queda visto */
  | { type: 'readInbox' }
  /** 🆕 Saliste de una pantalla: lo nuevo que había ahí ya lo viste */
  | { type: 'markSeen'; keys: string[] }
  // 📦 Abrir una caja: qué artefacto salió se decide afuera (azar), con rollArtifact
  | { type: 'openBox'; artifact: string }
  | { type: 'buyBox' }
  // 🦄 Salir a la bolsa: el final del juego (desde las 12 ventas)
  | { type: 'ipo'; now: number }
  // 🏁 Elegir el desafío de la empresa nueva (null = jugar sin desafío)
  | { type: 'setChallenge'; id: string | null }
  // 👹 Llega un cliente jefe al tablón (la oferta se arma afuera: usa azar)
  | { type: 'spawnBoss'; offer: Contract }
  | { type: 'buyEditor' }
  | { type: 'setLook'; look: EditorId }
  | { type: 'toggleDarkMode' }
  | { type: 'setDim'; dim: boolean }
  | { type: 'setAutoAccept'; on: boolean }
  // El tablón nuevo se arma afuera (usa azar y la hora) y llega ya calculado
  | { type: 'accept'; offer: Contract; offers: Contract[]; cooldowns: Cooldowns }
  // Empezar de cero: el estado inicial también se arma afuera (tiene ofertas al azar)
  | { type: 'reset'; state: GameState }
  // Vender la empresa: arranca una partida nueva (armada afuera, tiene azar) conservando el prestigio
  | { type: 'sell'; fresh: GameState; now: number }
  | { type: 'invest'; investment: InvestmentId }
  | { type: 'dismissNotice' }
  // 🛠 Solo el panel de desarrollo: pisa campos del estado tal cual
  | { type: 'dev'; patch: Partial<GameState> }
  // Un segundo más de juego (lo manda un reloj en App mientras la pestaña está visible)
  // session: segundos desde que se abrió el juego (no se guarda)
  | { type: 'playTime'; seconds: number; session?: number }

export function createInitialState(): GameState {
  const state: GameState = {
    code: 0,
    money: 0,
    xp: 0,
    rep: 0,
    skills: INITIAL_SKILLS,
    tech: INITIAL_TECH,
    editor: 'nano',
    look: 'nano',
    darkMode: { owned: false, on: false },
    dim: false,
    autoAccept: true,
    focus: INITIAL_FOCUS,
    abilities: INITIAL_ABILITIES,
    cards: [],
    cardOffer: null,
    combo: { count: 0, lastAt: 0 },
    bossCountdown: BOSS_EVERY,
    challenge: null,
    challengeChoice: false,
    modifiers: [],
    team: [],
    candidates: createInitialCandidates(),
    stage: 0,
    endless: 0,
    office: 0,
    offers: createInitialOffers(INITIAL_TECH),
    cooldowns: {},
    contract: null,
    timeLeft: 0,
    notice: null,
    stats: INITIAL_STATS,
    prestige: INITIAL_PRESTIGE,
    records: INITIAL_RECORDS,
    contractClicks: 0,
    rerolls: 0,
    macro: 0,
    macroOn: true,
    tampered: false,
    company: randomCompany(),
    profile: DEFAULT_PROFILE,
    inbox: INITIAL_INBOX,
    log: [{ id: 1, kind: 'info', text: 'Dev Clicker v0.1.0 — sesión iniciada. Elegí un contrato en ofertas/' }],
  }
  // Lo que ya está disponible al empezar no es "nuevo"
  return { ...state, records: { ...state.records, seen: allAvailable(state) } }
}

/**
 * Entrega el contrato en curso: cobra, suma XP y reputación y libera el editor.
 * La usan la acción 'deliver' (botón git push) y la Entrega continua (automática).
 */
/** Aplica un efecto de un evento (D6). Los malos nunca hacen fallar un contrato por sí solos */
function applyEffect(
  state: GameState,
  effect: Effect,
  { now, icon, candidates }: { now: number; icon: string; candidates?: Employee[] },
): GameState {
  const { contract } = state
  switch (effect.kind) {
    case 'rep':
      return { ...state, rep: Math.max(0, state.rep + effect.amount) }
    case 'xp': {
      // Referencia: el contrato actual, o el promedio del tablón
      const reference =
        contract?.reward.xp ?? state.offers.reduce((sum, o) => sum + o.reward.xp, 0) / Math.max(1, state.offers.length)
      const xp = Math.round(reference * effect.contracts)
      return { ...state, xp: state.xp + xp, stats: { ...state.stats, xpEarned: state.stats.xpEarned + xp } }
    }
    case 'pay':
      return { ...state, money: state.money - Math.floor(state.money * effect.pct) }
    case 'mod':
      return {
        ...state,
        modifiers: [
          ...state.modifiers,
          {
            id: `${icon}-${now}-${effect.target}`,
            icon,
            target: effect.target,
            mult: effect.mult,
            // 🎧 Auriculares: los efectos malos duran menos
            endsAt: now + effect.seconds * 1000 * (effect.mult < 1 ? bonuses(state).badEventMult : 1),
          },
        ],
      }
    case 'time':
      // Nunca menos de 5 s: te complica, pero no te hace perder solo
      return contract ? { ...state, timeLeft: Math.max(5, state.timeLeft * (1 + effect.pct)) } : state
    case 'code': {
      if (!contract) return state
      const target = Math.max(1, Math.round(contract.code * (1 + effect.pct)))
      return { ...state, contract: { ...contract, code: target }, code: Math.min(state.code, target) }
    }
    case 'progress':
      return contract ? { ...state, code: Math.min(contract.code, state.code + contract.code * effect.pct) } : state
    case 'reward':
      return contract
        ? {
            ...state,
            contract: {
              ...contract,
              reward: { ...contract.reward, money: Math.round((contract.reward.money * effect.mult) / 5) * 5 },
            },
          }
        : state
    case 'focusReset':
      return {
        ...state,
        focus: { ...state.focus, readyAt: Math.min(state.focus.readyAt, Math.max(now, state.focus.endsAt)) },
      }
    case 'candidates':
      return candidates ? { ...state, candidates } : state
    case 'box':
      return { ...state, records: { ...state.records, boxes: state.records.boxes + 1 } }
  }
}

/** Rama Arranque del prestigio (E5): con qué empieza la empresa nueva */
function startPerks(fresh: GameState, old: GameState): Partial<GameState> {
  const { portfolio, license, cofounder, processes } = old.prestige.investments
  const perks: Partial<GameState> = {}
  if (portfolio > 0) {
    const level = portfolio >= 2 ? 5 : 3
    perks.tech = { ...fresh.tech, html: level, css: level, javascript: level }
  }
  if (license > 0) {
    const editor: EditorId = license >= 2 ? 'vscode' : 'sublime'
    perks.editor = editor
    perks.look = editor
  }
  if (cofounder > 0 && old.team.length > 0) {
    // El de más estrellas; a igualdad, un dev (sin devs no hay producción)
    const best = [...old.team].sort(
      (a, b) => b.stars - a.stars || Number(b.role === 'dev') - Number(a.role === 'dev'),
    )[0]
    perks.team = [best]
    perks.candidates = fresh.candidates.filter((c) => c.name !== best.name)
  }
  if (processes > 0) perks.skills = { ...fresh.skills, autoDeliver: 1, autoAccept: 1 }
  return perks
}

/** Con Entrega continua, un contrato completo se entrega solo (GDD §9) */
function finishIfDone(state: GameState): GameState {
  const done = state.contract !== null && state.code >= state.contract.code
  return done && state.skills.autoDeliver > 0 ? deliverContract(state) : state
}

function deliverContract(state: GameState): GameState {
  const { contract } = state
  if (!contract || state.code < contract.code) return state
  const { reward } = contract
  const { investments } = state.prestige
  const xp = Math.round(
    reward.xp *
      xpMultiplier(state.skills.logicalThinking) *
      (1 + 0.05 * state.skills.knowledge) *
      qaMultiplier(state.team, state.skills.codeReview) *
      investmentBonus(investments.fastLearning) *
      bonuses(state).xpMult,
  )
  // +10 % de dinero por cada nivel de la tecnología del contrato por encima del 1 (GDD §7)
  const techLevel = state.tech[LANG_TECH[contract.lang ?? 'html']]
  // Grupos distintos se multiplican: tecnología × Contratos premium (GDD §10)
  const techBonus = 1 + 0.1 * Math.max(0, techLevel - 1)
  // Negociador: +5 % por nivel
  const negotiation = 1 + 0.05 * state.skills.negotiator
  const money =
    Math.round(
      (reward.money *
        techBonus *
        negotiation *
        investmentBonus(investments.premiumContracts) *
        uxMultiplier(state.team) *
        bonuses(state).payMult) /
        5,
    ) * 5
  return {
    ...state,
    money: state.money + money,
    xp: state.xp + xp,
    rep: state.rep + reward.rep + state.skills.marketing,
    code: 0, // el código no se acumula entre contratos (GDD §3)
    contract: null,
    endless: isEndless(state.stage) ? state.endless + 1 : state.endless,
    // 👹 Cada contrato normal desde Estudio acerca al próximo jefe
    bossCountdown: !contract.boss && state.stage >= 1 ? state.bossCountdown - 1 : state.bossCountdown,
    stats: {
      ...state.stats,
      moneyEarned: state.stats.moneyEarned + money,
      xpEarned: state.stats.xpEarned + xp,
      contractsDone: state.stats.contractsDone + 1,
      specialsDone: state.stats.specialsDone + (contract.special && !contract.boss ? 1 : 0),
    },
    records: {
      ...state.records,
      contracts: state.records.contracts + 1,
      specials: state.records.specials + (contract.special && !contract.boss ? 1 : 0),
      bosses: state.records.bosses + (contract.boss ? 1 : 0),
      boxes: state.records.boxes + (contract.boss ? 1 : 0),
    },
    notice: {
      kind: 'success',
      text: contract.boss
        ? `👹 ¡Le ganaste a ${contract.client}! +${formatMoney(money)} · +${formatNumber(xp)} XP · 📦 +1 caja de suministros`
        : `${contract.client} pagó: +${formatMoney(money)} · +${formatNumber(xp)} XP · +${reward.rep + state.skills.marketing} ★`,
    },
    log: addLog(
      state.log,
      'success',
      `git push origin main → deploy exitoso 🚀 +${formatMoney(money)} · +${formatNumber(xp)} XP · +${reward.rep + state.skills.marketing} ★`,
    ),
  }
}

function reduce(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'accept': {
      if (state.contract) return state
      return {
        ...state,
        contract: action.offer,
        offers: action.offers,
        cooldowns: action.cooldowns,
        timeLeft: action.offer.time,
        code: 0,
        contractClicks: 0,
        notice: null,
        log: addLog(
          state.log,
          'info',
          `git checkout -b ${action.offer.id} · ${action.offer.client} · el reloj arrancó`,
        ),
      }
    }

    case 'program': {
      const { contract } = state
      if (!contract || state.code >= contract.code) return state
      const focus = isFocused(state.focus, action.now) ? focusMultiplier(state.skills.flowState) : 1
      const crit = action.crit && !action.macro
      // Pair programming: cada clic tuyo suma también unos segundos de lo que produce el equipo
      // (y la carta "Pair programming de por vida", que suma siempre)
      const pairTime =
        (action.now < state.abilities.pair.endsAt ? pairSeconds(state.skills.pairProgramming) : 0) +
        bonuses(state).pairSeconds
      const pair = !action.macro && pairTime > 0 ? autoRateOf(state, action.now) * pairTime : 0
      const lines = clickRate(state, action.now) * focus * (crit ? critMultiplier(state) : 1) + pair
      const code = addCode(state.code, lines, contract.code)
      let log = state.log
      if (crit) log = addLog(log, 'crit', `⚡ Crítico: +${formatRate(lines)} líneas sin un solo typo. Sospechoso.`)
      if (code >= contract.code)
        log = addLog(log, 'success', `✓ Build OK · ${contract.code} líneas · listo para git push`)
      const { records } = state
      // Los clics de la macro escriben código, pero no son tuyos: no cuentan para clics ni logros
      if (action.macro)
        return finishIfDone({
          ...state,
          code,
          log,
          records: { ...records, lines: records.lines + (code - state.code) },
        })
      // 🃏 Combo: sigue si el clic anterior fue hace menos de 1 s; si no, arranca de nuevo
      const combo = {
        count: action.now - state.combo.lastAt <= 1000 ? state.combo.count + 1 : 1,
        lastAt: action.now,
      }
      return finishIfDone({
        ...state,
        code,
        log,
        combo,
        contractClicks: state.contractClicks + 1,
        records: {
          ...records,
          clicks: records.clicks + 1,
          crits: records.crits + (crit ? 1 : 0),
          lines: records.lines + (code - state.code),
          recentCrits: crit ? [...records.recentCrits, action.now].slice(-20) : records.recentCrits,
        },
      })
    }

    case 'deliver':
      return deliverContract(state)

    case 'tick': {
      // Inversores: el dinero en mano rinde intereses (no cuenta como ganado con contratos)
      if (state.skills.investors > 0)
        state = {
          ...state,
          money: state.money * (1 + (INTEREST_PER_MINUTE * state.skills.investors * action.elapsed) / 60),
        }
      const { contract } = state
      if (!contract || state.code >= contract.code) return state

      // 1. El equipo escribe código (GDD §5)
      const code = addCode(state.code, autoRateOf(state, action.now) * action.elapsed, contract.code)
      const records = { ...state.records, lines: state.records.lines + (code - state.code) }
      // Si se completó en este mismo tick, el reloj se detiene: no puede fallar
      if (code >= contract.code) {
        return finishIfDone({
          ...state,
          code,
          records,
          log: addLog(state.log, 'success', `✓ Build OK · el equipo terminó ${contract.code} líneas`),
        })
      }

      // 2. Corre el reloj
      const timeLeft = Math.max(0, state.timeLeft - action.elapsed)
      if (timeLeft > 0) return { ...state, code, timeLeft, records }

      // 3. Se venció el plazo. Contra un jefe solo se pierde la oportunidad (y se aprende algo)
      if (contract.boss) {
        const gainedXp = failureXp(contract.reward.xp)
        return {
          ...state,
          records,
          xp: state.xp + gainedXp,
          code: 0,
          contract: null,
          timeLeft: 0,
          stats: {
            ...state.stats,
            contractsFailed: state.stats.contractsFailed + 1,
            xpEarned: state.stats.xpEarned + gainedXp,
          },
          notice: {
            kind: 'error',
            text: `👹 ${contract.client} se fue sin pagar. Esta vez ganó el jefe. +${formatNumber(gainedXp)} XP por intentarlo`,
          },
          log: addLog(state.log, 'error', `✗ El jefe ganó esta vez (${Math.floor(code)}/${contract.code})`),
        }
      }

      // Contrato normal (GDD §4): pérdidas leves y un poco de XP
      const lostMoney = failureMoneyLoss(state.money)
      const gainedXp = failureXp(contract.reward.xp)
      return {
        ...state,
        money: state.money - lostMoney,
        records,
        rep: Math.max(0, state.rep - FAILURE_REP_LOSS),
        xp: state.xp + gainedXp,
        code: 0,
        contract: null,
        timeLeft: 0,
        stats: {
          ...state.stats,
          contractsFailed: state.stats.contractsFailed + 1,
          xpEarned: state.stats.xpEarned + gainedXp,
        },
        notice: {
          kind: 'error',
          text: `Se venció el plazo: ${contract.client} contrató a un primo. −${formatMoney(lostMoney)} · −${FAILURE_REP_LOSS} ★ · +${gainedXp} XP por la experiencia`,
        },
        log: addLog(
          state.log,
          'error',
          `✗ DeadlineExceededException en ${contract.id} (${Math.floor(code)}/${contract.code})`,
        ),
      }
    }

    case 'learnTech': {
      const tech = TECHS.find((t) => t.id === action.tech)
      if (!tech) return state
      const level = state.tech[tech.id]
      const cost = skillCost(tech.baseCost, level, tech.minStage)
      if (level >= tech.maxLevel || state.xp < cost || missingRequirements(tech, state.tech, state.stage)) return state
      return {
        ...state,
        xp: state.xp - cost,
        tech: { ...state.tech, [tech.id]: level + 1 },
        log: addLog(
          state.log,
          'success',
          level === 0
            ? `npm install ${tech.id} · added 1 package and 1.400 dependencies`
            : `${tech.name} Nv.${level + 1} · ${tech.effect}`,
        ),
      }
    }

    case 'buySkill': {
      const skill = SKILLS.find((s) => s.id === action.skill)
      if (!skill) return state
      const level = state.skills[skill.id]
      const cost = skillCost(skill.baseCost, level, skill.minStage)
      if (level >= skill.maxLevel || state.xp < cost || missingSkillRequirements(skill, state.skills, state.stage))
        return state
      return {
        ...state,
        xp: state.xp - cost,
        skills: { ...state.skills, [skill.id]: level + 1 },
        log: addLog(state.log, 'info', `npm install ${skill.id}@${level + 1} · ${skill.effect}`),
      }
    }

    case 'reset':
      return action.state

    case 'sell': {
      if (!isEndless(state.stage)) return state
      const value = companyValue(state.stats.moneyEarned, state.team)
      // 🏁 Desafío completado: más tokens (y cajas extra la primera vez)
      const challenge = getChallenge(state.challenge)
      const firstTime = challenge !== undefined && !state.records.challengesDone.includes(challenge.id)
      // 💻 Laptop con stickers: tokens extra por venta
      const tokens = Math.round(tokensForValue(value) * (1 + (challenge?.tokenBonus ?? 0))) + bonuses(state).saleTokens
      const { investments } = state.prestige
      return {
        ...action.fresh,
        // Ventajas iniciales de Innovación
        ...startPerks(action.fresh, state),
        money: action.fresh.money + SEED_CAPITAL * investments.seedCapital,
        rep: action.fresh.rep + FIRST_CONTACTS_REP * investments.firstContacts,
        dim: state.dim, // la accesibilidad no es progreso: se conserva
        // Cada venta trae una 📦 caja de suministros (y el desafío completado, más)
        records: {
          ...state.records,
          boxes: state.records.boxes + 1 + (firstTime ? CHALLENGE_FIRST_BOXES : 0),
          challengesDone: firstTime ? [...state.records.challengesDone, challenge.id] : state.records.challengesDone,
        },
        // La empresa nueva arranca preguntando si querés un desafío
        challengeChoice: true,
        tampered: state.tampered, // la marca es de la carrera, no de la empresa
        profile: state.profile, // el avatar, el título y la mascota son tuyos
        inbox: state.inbox, // las notificaciones son de la carrera
        prestige: {
          tokens: state.prestige.tokens + tokens,
          sales: state.prestige.sales + 1,
          investments,
          history: [
            {
              soldAt: action.now,
              value,
              tokens,
              moneyEarned: state.stats.moneyEarned,
              contractsDone: state.stats.contractsDone,
              contractsFailed: state.stats.contractsFailed,
              teamSize: state.team.length,
              endless: state.endless,
              playTime: state.stats.playTime,
              challenge: state.challenge ?? undefined,
              company: state.company,
            },
            ...state.prestige.history,
          ],
        },
        notice: {
          kind: 'success',
          text: `💼 Vendiste la empresa por ${formatMoney(value)}. +${tokens} tokens de inversión. A empezar de nuevo.`,
        },
        log: addLog(
          action.fresh.log,
          'success',
          `git init · nueva empresa (venta n.º ${state.prestige.sales + 1}) · +${tokens} tokens`,
        ),
      }
    }

    case 'invest': {
      const investment = INVESTMENTS.find((i) => i.id === action.investment)
      if (!investment) return state
      const { investments, tokens } = state.prestige
      const level = investments[investment.id]
      const cost = investmentCost(investment, level)
      const locked = investment.requires && investments[investment.requires] === 0
      if (level >= investment.maxLevel || tokens < cost || locked) return state
      return {
        ...state,
        prestige: {
          ...state.prestige,
          tokens: tokens - cost,
          investments: { ...investments, [investment.id]: level + 1 },
        },
        log: addLog(
          state.log,
          'success',
          `${investment.icon} ${investment.name} Nv.${level + 1} · ${investment.effect}`,
        ),
      }
    }

    case 'playTime':
      return { ...state, stats: { ...state.stats, playTime: state.stats.playTime + action.seconds } }

    case 'dev':
      return { ...state, ...action.patch }

    case 'dismissNotice':
      return { ...state, notice: null }

    case 'toggleDarkMode': {
      // Primera vez: se compra. Después: interruptor
      if (state.darkMode.owned) return { ...state, darkMode: { owned: true, on: !state.darkMode.on } }
      if (state.money < DARK_MODE_PRICE) {
        return {
          ...state,
          notice: {
            kind: 'error',
            text: `Te faltan $${DARK_MODE_PRICE - state.money} para el modo oscuro. Mientras tanto, entrecerrá los ojos.`,
          },
        }
      }
      return {
        ...state,
        money: state.money - DARK_MODE_PRICE,
        darkMode: { owned: true, on: true },
        log: addLog(state.log, 'success', 'npm install modo-oscuro · tus retinas te lo agradecen'),
      }
    }

    case 'setDim':
      return { ...state, dim: action.dim }

    case 'focus': {
      const level = state.skills.focus
      if (level === 0 || action.now < state.focus.readyAt) return state
      // ☕ Taza infinita: dura más
      const endsAt = action.now + focusDuration(level) * 1000 * bonuses(state).durationMult
      return {
        ...state,
        focus: { endsAt, readyAt: endsAt + FOCUS_COOLDOWN * 1000 * bonuses(state).cooldownMult },
        log: addLog(
          state.log,
          'crit',
          `🎯 Concentración: auriculares puestos, Slack cerrado. ×${focusMultiplier(state.skills.flowState)} por ${focusDuration(level)} s`,
        ),
      }
    }

    case 'ability': {
      const ability = ABILITIES.find((a) => a.id === action.id)
      const level = ability ? state.skills[ability.skill] : 0
      if (!ability || level === 0 || action.now < state.abilities[ability.id].readyAt) return state
      const { now } = action
      const cards = bonuses(state)
      const timer = {
        endsAt: now + ability.duration(level) * 1000 * cards.durationMult,
        readyAt: now + ability.cooldown(level) * 1000 * cards.cooldownMult,
      }
      let next: GameState = {
        ...state,
        modifiers: activeModifiers(state.modifiers, now),
        abilities: { ...state.abilities, [ability.id]: timer },
      }
      if (ability.id === 'hackathon')
        next.modifiers = [
          ...next.modifiers,
          {
            id: `hackathon-${now}`,
            icon: '🏃',
            target: 'click',
            mult: HACKATHON_MULT + cards.hackathonExtra, // 🏆 Trofeo de hackatón
            endsAt: timer.endsAt,
          },
        ]
      if (ability.id === 'crunch') {
        const peak = now + CRUNCH_SECONDS * 1000
        next.modifiers = [
          ...next.modifiers,
          { id: `crunch-${now}`, icon: '🔥', target: 'auto', mult: CRUNCH_MULT, endsAt: peak },
          {
            id: `tired-${now}`,
            icon: '😴',
            target: 'auto',
            // 🃏 Crunch sin culpa: no hay cansancio
            mult: cards.crunchNoTired ? 1 : crunchTired(level),
            startsAt: peak,
            endsAt: timer.endsAt,
          },
        ]
      }
      if (ability.id === 'coffee') {
        // Todas las demás (y el Foco) quedan listas ya: lo que esté activo sigue activo
        const ready = (t: { endsAt: number; readyAt: number }) => ({
          ...t,
          readyAt: Math.min(t.readyAt, Math.max(now, t.endsAt)),
        })
        next = {
          ...next,
          focus: ready(next.focus),
          abilities: {
            hackathon: ready(next.abilities.hackathon),
            crunch: ready(next.abilities.crunch),
            pair: ready(next.abilities.pair),
            coffee: timer,
          },
        }
      }
      return { ...next, log: addLog(next.log, 'crit', `${ability.icon} ${ability.name}: ${ability.describe(level)}`) }
    }

    case 'intern': {
      const intern = state.team.find((e) => e.uid === action.uid && e.role === 'intern')
      const { contract } = state
      if (!intern || !contract || state.code >= contract.code) return state
      const lines = Math.max(1, Math.round(contract.code * internSwing(intern.stars, action.surprise)))
      const text = action.surprise
        ? `🎓 ${intern.name} (pasante) se iluminó: +${formatRate(lines)} líneas`
        : `🎓 ${intern.name} (pasante) metió un bug: −${formatRate(lines)} líneas`
      return finishIfDone({
        ...state,
        code: action.surprise ? Math.min(contract.code, state.code + lines) : Math.max(0, state.code - lines),
        notice: { kind: action.surprise ? 'success' : 'error', text },
        log: addLog(state.log, action.surprise ? 'success' : 'error', text),
      })
    }

    case 'catchBug':
      return {
        ...state,
        records: { ...state.records, bugs: state.records.bugs + 1 },
        modifiers: [
          ...activeModifiers(state.modifiers, action.now),
          {
            id: `bug-${action.now}`,
            icon: '🐛',
            target: 'auto',
            mult: BUG_MULTIPLIER,
            endsAt: action.now + BUG_DURATION * 1000,
          },
        ],
        log: addLog(
          state.log,
          'crit',
          `🐛 ¡Bug dorado atrapado! El equipo produce ×${BUG_MULTIPLIER} por ${BUG_DURATION} s`,
        ),
      }

    case 'applyEvent': {
      const { records, stats } = state
      let next: GameState = {
        ...state,
        modifiers: activeModifiers(state.modifiers, action.now),
        stats: { ...stats, badEvents: stats.badEvents + (action.tone === 'bad' ? 1 : 0) },
        records: {
          ...records,
          goodStreak: action.tone === 'good' ? records.goodStreak + 1 : action.tone ? 0 : records.goodStreak,
          betsWon: records.betsWon + (action.bet === 'won' ? 1 : 0),
        },
      }
      for (const effect of action.effects) next = applyEffect(next, effect, action)
      return finishIfDone({ ...next, log: addLog(next.log, 'info', `${action.icon} ${action.text}`) })
    }

    case 'minigame': {
      const reward = minigameReward(action.score)
      let next: GameState = {
        ...state,
        modifiers: activeModifiers(state.modifiers, action.now),
        records: { ...state.records, minigames: state.records.minigames + 1 },
      }
      if (!reward) return { ...next, log: addLog(next.log, 'error', '🎮 Minijuego perdido. Nadie se enteró.') }
      const effects: Effect[] = [
        // 🎮 Joystick: el premio es más fuerte
        {
          kind: 'mod',
          target: 'auto',
          mult: reward.mult * bonuses(state).minigameMult,
          seconds: MINIGAME_REWARD_SECONDS,
        },
        { kind: 'xp', contracts: reward.xp },
      ]
      for (const effect of effects) next = applyEffect(next, effect, { now: action.now, icon: '🎮' })
      return {
        ...next,
        log: addLog(
          next.log,
          'crit',
          `🎮 Minijuego: equipo ×${formatRate(reward.mult)} por ${MINIGAME_REWARD_SECONDS} s + XP`,
        ),
      }
    }

    case 'buyMacro': {
      const next = MACRO_LEVELS[state.macro]
      if (!next || state.money < next.price || state.stage < next.minStage) return state
      return {
        ...state,
        money: state.money - next.price,
        macro: state.macro + 1,
        macroOn: true,
        log: addLog(
          state.log,
          'success',
          `🤖 ${next.name} instalada · ${next.cps} clic${next.cps > 1 ? 's' : ''} por segundo, sin cansarse`,
        ),
      }
    }

    case 'setMacro':
      return { ...state, macroOn: action.on }

    case 'setAutoAccept':
      return { ...state, autoAccept: action.on }

    case 'setLook': {
      const owned = EDITORS.findIndex((e) => e.id === state.editor)
      const wanted = EDITORS.findIndex((e) => e.id === action.look)
      if (wanted < 0 || wanted > owned) return state
      return { ...state, look: action.look }
    }

    case 'buyEditor': {
      const next = nextEditor(state.editor)
      if (!next || state.money < next.price || state.stage < (next.minStage ?? 0)) return state
      if (getChallenge(state.challenge)?.nanoOnly) return state // 🐧 Nano para siempre
      return {
        ...state,
        money: state.money - next.price,
        editor: next.id,
        look: next.id, // al comprar uno nuevo, se usa directamente
        log: addLog(state.log, 'success', `Instalado ${next.name} · ${next.bonusText}`),
      }
    }

    case 'moveOffice': {
      const next = OFFICES[state.office + 1]
      if (!next || state.money < next.price || state.stage < next.minStage) return state
      return {
        ...state,
        money: state.money - next.price,
        office: state.office + 1,
        log: addLog(
          state.log,
          'success',
          `📦 Mudanza a ${next.name} · ahora entran ${officeCapacity(state.office + 1, state.skills.homeOffice)} empleados`,
        ),
      }
    }

    case 'ipo':
      if (state.prestige.sales < IPO_SALES || state.records.ipoAt > 0) return state
      return {
        ...state,
        records: { ...state.records, ipoAt: action.now },
        log: addLog(state.log, 'crit', '🦄 git tag v1.0.0-IPO · ¡Tu empresa salió a la bolsa! Sos una leyenda.'),
      }

    case 'setCompany':
      return { ...state, company: cleanCompany(action.company) }

    case 'setProfile':
      return { ...state, profile: cleanProfile({ ...state.profile, ...action.profile }, state.records.unlocked) }

    case 'markSeen': {
      const seen = new Set(state.records.seen)
      const fresh = action.keys.filter((k) => !seen.has(k))
      if (fresh.length === 0) return state
      return { ...state, records: { ...state.records, seen: [...state.records.seen, ...fresh].slice(-SEEN_LIMIT) } }
    }

    case 'readInbox': {
      const last = state.inbox.items.at(-1)?.id ?? 0
      return last > state.inbox.seen ? { ...state, inbox: { ...state.inbox, seen: last } } : state
    }

    case 'pet':
      return state.profile.mascot ? { ...state, records: { ...state.records, pets: state.records.pets + 1 } } : state

    case 'setChallenge': {
      if (!state.challengeChoice) return state
      const challenge = getChallenge(action.id)
      return {
        ...state,
        challenge: challenge?.id ?? null,
        challengeChoice: false,
        // 🐧 Nano para siempre: aunque la Licencia vitalicia te haya dado otro editor
        ...(challenge?.nanoOnly ? { editor: 'nano' as const, look: 'nano' as const } : {}),
        log: addLog(
          state.log,
          challenge ? 'crit' : 'info',
          challenge
            ? `🏁 Desafío: ${challenge.icon} ${challenge.name} · ${challenge.rule}`
            : 'Empresa nueva, sin desafío',
        ),
      }
    }

    case 'openBox': {
      const artifact = getArtifact(action.artifact)
      const level = state.records.artifacts[action.artifact] ?? 0
      if (!artifact || state.records.boxes < 1 || level >= MAX_ARTIFACT_LEVEL) return state
      return {
        ...state,
        records: {
          ...state.records,
          boxes: state.records.boxes - 1,
          artifacts: { ...state.records.artifacts, [artifact.id]: level + 1 },
        },
        log: addLog(
          state.log,
          'crit',
          level === 0
            ? `📦 ¡Artefacto nuevo! ${artifact.icon} ${artifact.name}: ${artifact.text(1)}`
            : `📦 ${artifact.icon} ${artifact.name} sube a Nv.${level + 1}: ${artifact.text(level + 1)}`,
        ),
      }
    }

    case 'buyBox': {
      const price = boxPrice(state.records.boxesBought)
      if (state.prestige.tokens < price) return state
      return {
        ...state,
        prestige: { ...state.prestige, tokens: state.prestige.tokens - price },
        records: {
          ...state.records,
          boxes: state.records.boxes + 1,
          boxesBought: state.records.boxesBought + 1,
        },
        log: addLog(state.log, 'success', `📦 Compraste una caja de suministros por ${price} tokens`),
      }
    }

    case 'spawnBoss': {
      if (state.stage < 1 || state.offers.some((o) => o.boss) || state.contract?.boss) return state
      const boss = getBoss(action.offer.boss ?? '')
      return {
        ...state,
        offers: [action.offer, ...state.offers],
        bossCountdown: BOSS_EVERY,
        log: addLog(state.log, 'crit', `👹 Llegó un cliente jefe: ${boss?.icon ?? ''} ${action.offer.client}`),
      }
    }

    case 'pickCard': {
      const pick = state.cardOffer?.[action.index]
      const card = pick && getCard(pick.id)
      if (!pick || !card) return state
      return {
        ...state,
        cards: [...state.cards, pick],
        cardOffer: null,
        log: addLog(
          state.log,
          'crit',
          `🃏 ${pick.rare ? '✨ RARA · ' : ''}${card.icon} ${card.name}: ${card.text(pick.rare)}`,
        ),
      }
    }

    case 'ascend': {
      if (!canAscend(state)) return state
      const next = STAGES[state.stage + 1]
      return {
        ...state,
        stage: state.stage + 1,
        offers: action.offers,
        candidates: action.candidates,
        // 🃏 Sin especializaciones: el desafío no ofrece cartas
        cardOffer: action.cardOffer.length && !getChallenge(state.challenge)?.noCards ? action.cardOffer : null,
        notice: {
          kind: 'success',
          text: `${next.icon} ¡Ahora sos ${next.name}! Se desbloquea: ${next.unlocks.toLowerCase()}`,
        },
        log: addLog(state.log, 'success', `git tag v${state.stage + 2}.0.0 · la empresa ascendió a ${next.name}`),
      }
    }

    case 'hire': {
      const candidate = state.candidates.find((c) => c.uid === action.uid)
      if (!candidate) return state
      const price = employeePrice(candidate.role, candidate.stars, state.stage)
      if (state.money < price) return state

      let team = state.team
      let log = state.log
      let replaced = 0
      if (team.length >= officeCapacity(state.office, state.skills.homeOffice)) {
        // Oficina llena: solo se puede contratar reemplazando a alguien (GDD §5)
        const leaving = team.find((e) => e.uid === action.replaceUid)
        if (!leaving) return state
        team = team.filter((e) => e !== leaving)
        replaced = 1
        log = addLog(
          log,
          'error',
          `kill -9 ${leaving.role}-${leaving.name.toLowerCase()}.exe · ${leaving.name} se fue (sin reintegro)`,
        )
      }

      return {
        ...state,
        money: state.money - price,
        team: [...team, candidate],
        candidates: action.candidates,
        rerolls: 0,
        records: { ...state.records, replacements: state.records.replacements + replaced },
        log: addLog(
          log,
          'success',
          `sudo useradd ${candidate.role}-${candidate.name.toLowerCase()} · ${employeeEffect(candidate.role, candidate.stars)}`,
        ),
      }
    }

    case 'rerollCandidates': {
      const price = rerollPrice(state.stage, state.rerolls)
      if (state.money < price) return state
      return {
        ...state,
        money: state.money - price,
        rerolls: state.rerolls + 1,
        candidates: action.candidates,
        log: addLog(state.log, 'info', 'Publicaste otra búsqueda en LinkedIn · llegaron candidatos nuevos'),
      }
    }
  }
}

/** Desbloquea los logros que se cumplieron con esta acción (D8) */
function unlockAchievements(prev: GameState, next: GameState, action: GameAction): GameState {
  const unlocked = new Set(next.records.unlocked)
  const fresh = ACHIEVEMENTS.filter((a) => !unlocked.has(a.id) && a.check({ prev, next, action }))
  if (fresh.length === 0) return next
  let log = next.log
  for (const a of fresh) log = addLog(log, 'crit', `🏆 Logro desbloqueado: ${a.icon} ${a.name} · +1 % de producción`)
  return { ...next, log, records: { ...next.records, unlocked: [...next.records.unlocked, ...fresh.map((a) => a.id)] } }
}

/** 🔓 Revela las funcionalidades que se volvieron útiles (la interfaz las anuncia) */
function unlockFeatures(next: GameState): GameState {
  const known = new Set(next.records.features)
  const fresh = FEATURES.filter((f) => !known.has(f.id) && f.check(next))
  if (fresh.length === 0) return next
  let log = next.log
  for (const f of fresh) log = addLog(log, 'crit', `🔓 Nuevo: ${f.icon} ${f.name}`)
  return { ...next, log, records: { ...next.records, features: [...next.records.features, ...fresh.map((f) => f.id)] } }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const next = reduce(state, action)
  // 'reset' e importar arrancan otra carrera: no se mezclan con la anterior
  if (next === state || action.type === 'reset') return next
  return notify(state, unlockFeatures(unlockAchievements(state, next, action)), action)
}
