// Todo el estado del juego y las reglas que lo cambian.
// El reducer es una función pura: (estado, acción) → estado nuevo. No usa React,
// no lee la hora ni números al azar: eso llega desde afuera, dentro de las acciones.
import { FAILURE_REP_LOSS, addCode, failureMoneyLoss, failureXp, skillCost, xpMultiplier } from './formulas'
import { INITIAL_SKILLS, SKILLS, missingSkillRequirements, type SkillId, type SkillLevels } from '../data/skills'
import { EDITORS, getEditor, nextEditor, type EditorId } from '../data/editors'
import { INITIAL_TECH, LANG_TECH, TECHS, missingRequirements, type TechId, type TechLevels } from '../data/techs'
import { OFFICES } from '../data/offices'
import { formatMoney, formatNumber, formatRate } from './format'
import { STAGES } from '../data/stages'
import { canAscend, companyValue, isEndless } from './stages'
import { INITIAL_PRESTIGE, investmentBonus, tokensForValue, type Prestige } from './prestige'
import { INVESTMENTS, investmentCost, type InvestmentId } from '../data/investments'
import { autoRateOf, clickRate } from './rates'
import { BUG_DURATION, BUG_MULTIPLIER } from './bug'
import { activeModifiers, type Modifier } from './modifiers'
import type { Effect } from '../data/events'
import { FOCUS_COOLDOWN, FOCUS_MULTIPLIER, INITIAL_FOCUS, focusDuration, isFocused, type Focus } from './focus'
import { createInitialOffers, type Cooldowns } from './offers'
import {
  REROLL_PRICE,
  createInitialCandidates,
  employeeEffect,
  employeePrice,
  qaMultiplier,
  type Employee,
} from './team'
import type { Contract } from './types'

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
}

export const INITIAL_STATS: Stats = { moneyEarned: 0, contractsDone: 0, contractsFailed: 0, playTime: 0, xpEarned: 0 }

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
  /** Lo único que sobrevive a vender la empresa */
  prestige: Prestige
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
  | { type: 'program'; crit: boolean; now: number }
  | { type: 'focus'; now: number }
  | { type: 'deliver' }
  // now: la hora, para el 🐛 bug dorado (opcional: la simulación no lo usa)
  | { type: 'tick'; elapsed: number; now?: number }
  | { type: 'catchBug'; now: number }
  // Un evento al azar ya resuelto (si tenía azar u opciones, se resolvió afuera)
  | { type: 'applyEvent'; text: string; icon: string; effects: Effect[]; now: number; candidates?: Employee[] }
  | { type: 'buySkill'; skill: SkillId }
  | { type: 'learnTech'; tech: TechId }
  // Los candidatos nuevos se generan afuera (usan azar) y llegan ya calculados
  // replaceUid: a quién se despide para hacer lugar si la oficina está llena (no se recupera el dinero)
  | { type: 'hire'; uid: string; replaceUid?: string; candidates: Employee[] }
  | { type: 'rerollCandidates'; candidates: Employee[] }
  | { type: 'moveOffice' }
  // Al ascender se arma un tablón nuevo con contratos de la etapa nueva (usa azar: llega calculado)
  | { type: 'ascend'; offers: Contract[]; candidates: Employee[] }
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
  // Un segundo más de juego (lo manda un reloj en App mientras la pestaña está visible)
  | { type: 'playTime'; seconds: number }

export function createInitialState(): GameState {
  return {
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
    log: [{ id: 1, kind: 'info', text: 'Dev Clicker v0.1.0 — sesión iniciada. Elegí un contrato en ofertas/' }],
  }
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
            endsAt: now + effect.seconds * 1000,
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
  }
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
      qaMultiplier(state.team) *
      investmentBonus(investments.fastLearning),
  )
  // +10 % de dinero por cada nivel de la tecnología del contrato por encima del 1 (GDD §7)
  const techLevel = state.tech[LANG_TECH[contract.lang ?? 'html']]
  // Grupos distintos se multiplican: tecnología × Contratos premium (GDD §10)
  const techBonus = 1 + 0.1 * Math.max(0, techLevel - 1)
  const money = Math.round((reward.money * techBonus * investmentBonus(investments.premiumContracts)) / 5) * 5
  return {
    ...state,
    money: state.money + money,
    xp: state.xp + xp,
    rep: state.rep + reward.rep,
    code: 0, // el código no se acumula entre contratos (GDD §3)
    contract: null,
    endless: isEndless(state.stage) ? state.endless + 1 : state.endless,
    stats: {
      ...state.stats,
      moneyEarned: state.stats.moneyEarned + money,
      xpEarned: state.stats.xpEarned + xp,
      contractsDone: state.stats.contractsDone + 1,
    },
    notice: {
      kind: 'success',
      text: `${contract.client} pagó: +${formatMoney(money)} · +${formatNumber(xp)} XP · +${reward.rep} ★`,
    },
    log: addLog(
      state.log,
      'success',
      `git push origin main → deploy exitoso 🚀 +${formatMoney(money)} · +${formatNumber(xp)} XP · +${reward.rep} ★`,
    ),
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
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
      const editor = getEditor(state.editor)
      const focus = isFocused(state.focus, action.now) ? FOCUS_MULTIPLIER : 1
      const lines = clickRate(state, action.now) * focus * (action.crit ? editor.critMultiplier : 1)
      const code = addCode(state.code, lines, contract.code)
      let log = state.log
      if (action.crit)
        log = addLog(log, 'crit', `⚡ Crítico: +${formatRate(lines)} líneas sin un solo typo. Sospechoso.`)
      if (code >= contract.code)
        log = addLog(log, 'success', `✓ Build OK · ${contract.code} líneas · listo para git push`)
      return finishIfDone({ ...state, code, log })
    }

    case 'deliver':
      return deliverContract(state)

    case 'tick': {
      const { contract } = state
      if (!contract || state.code >= contract.code) return state

      // 1. El equipo escribe código (GDD §5)
      const code = addCode(state.code, autoRateOf(state, action.now) * action.elapsed, contract.code)
      // Si se completó en este mismo tick, el reloj se detiene: no puede fallar
      if (code >= contract.code) {
        return finishIfDone({
          ...state,
          code,
          log: addLog(state.log, 'success', `✓ Build OK · el equipo terminó ${contract.code} líneas`),
        })
      }

      // 2. Corre el reloj
      const timeLeft = Math.max(0, state.timeLeft - action.elapsed)
      if (timeLeft > 0) return { ...state, code, timeLeft }

      // 3. Se venció el plazo (GDD §4): pérdidas leves y un poco de XP
      const lostMoney = failureMoneyLoss(state.money)
      const gainedXp = failureXp(contract.reward.xp)
      return {
        ...state,
        money: state.money - lostMoney,
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
      const cost = skillCost(tech.baseCost, level)
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
      const cost = skillCost(skill.baseCost, level)
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
      const tokens = tokensForValue(value)
      const { investments } = state.prestige
      return {
        ...action.fresh,
        // Ventajas iniciales de Innovación
        money: action.fresh.money + 2000 * investments.seedCapital,
        rep: action.fresh.rep + 5 * investments.firstContacts,
        dim: state.dim, // la accesibilidad no es progreso: se conserva
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
      const cost = investmentCost(level)
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
      const endsAt = action.now + focusDuration(level) * 1000
      return {
        ...state,
        focus: { endsAt, readyAt: endsAt + FOCUS_COOLDOWN * 1000 },
        log: addLog(
          state.log,
          'crit',
          `🎯 Concentración: auriculares puestos, Slack cerrado. ×${FOCUS_MULTIPLIER} por ${focusDuration(level)} s`,
        ),
      }
    }

    case 'catchBug':
      return {
        ...state,
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
      let next: GameState = { ...state, modifiers: activeModifiers(state.modifiers, action.now) }
      for (const effect of action.effects) next = applyEffect(next, effect, action)
      return finishIfDone({ ...next, log: addLog(next.log, 'info', `${action.icon} ${action.text}`) })
    }

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
      if (!next || state.money < next.price) return state
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
        log: addLog(state.log, 'success', `📦 Mudanza a ${next.name} · ahora entran ${next.capacity} empleados`),
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
      const price = employeePrice(candidate.role, candidate.stars)
      if (state.money < price) return state

      let team = state.team
      let log = state.log
      if (team.length >= OFFICES[state.office].capacity) {
        // Oficina llena: solo se puede contratar reemplazando a alguien (GDD §5)
        const leaving = team.find((e) => e.uid === action.replaceUid)
        if (!leaving) return state
        team = team.filter((e) => e !== leaving)
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
        log: addLog(
          log,
          'success',
          `sudo useradd ${candidate.role}-${candidate.name.toLowerCase()} · ${employeeEffect(candidate.role, candidate.stars)}`,
        ),
      }
    }

    case 'rerollCandidates': {
      if (state.money < REROLL_PRICE) return state
      return {
        ...state,
        money: state.money - REROLL_PRICE,
        candidates: action.candidates,
        log: addLog(state.log, 'info', 'Publicaste otra búsqueda en LinkedIn · llegaron candidatos nuevos'),
      }
    }
  }
}
