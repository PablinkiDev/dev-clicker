// Todo el estado del juego y las reglas que lo cambian.
// El reducer es una función pura: (estado, acción) → estado nuevo. No usa React,
// no lee la hora ni números al azar: eso llega desde afuera, dentro de las acciones.
import {
  DEVELOPER_PRICE,
  FAILURE_REP_LOSS,
  CRIT_MULTIPLIER,
  ROOM_CAPACITY,
  addCode,
  autoRate,
  failureMoneyLoss,
  failureXp,
  linesPerClick,
  skillCost,
  xpMultiplier,
} from './formulas'
import { INITIAL_SKILLS, SKILLS, type SkillId, type SkillLevels } from '../data/skills'
import { createInitialOffers, type Cooldowns } from './offers'
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

/** Cuántas líneas guarda la terminal */
const LOG_LIMIT = 50

export type GameState = {
  code: number
  money: number
  xp: number
  rep: number
  skills: SkillLevels
  developers: number
  offers: Contract[]
  cooldowns: Cooldowns
  /** Contrato en curso; null si no hay ninguno aceptado */
  contract: Contract | null
  timeLeft: number
  notice: Notice | null
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
  | { type: 'program'; crit: boolean }
  | { type: 'deliver' }
  | { type: 'tick'; elapsed: number }
  | { type: 'buySkill'; skill: SkillId }
  | { type: 'hireDeveloper' }
  // El tablón nuevo se arma afuera (usa azar y la hora) y llega ya calculado
  | { type: 'accept'; offer: Contract; offers: Contract[]; cooldowns: Cooldowns }
  // Empezar de cero: el estado inicial también se arma afuera (tiene ofertas al azar)
  | { type: 'reset'; state: GameState }
  | { type: 'dismissNotice' }

export function createInitialState(): GameState {
  return {
    code: 0,
    money: 0,
    xp: 0,
    rep: 0,
    skills: INITIAL_SKILLS,
    developers: 0,
    offers: createInitialOffers(),
    cooldowns: {},
    contract: null,
    timeLeft: 0,
    notice: null,
    log: [{ id: 1, kind: 'info', text: 'Dev Clicker v0.1.0 — sesión iniciada. Elegí un contrato en ofertas/' }],
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
        log: addLog(state.log, 'info', `git checkout -b ${action.offer.id} · ${action.offer.client} · el reloj arrancó`),
      }
    }

    case 'program': {
      const { contract } = state
      if (!contract || state.code >= contract.code) return state
      const lines = linesPerClick(state.skills.fastTyping) * (action.crit ? CRIT_MULTIPLIER : 1)
      const code = addCode(state.code, lines, contract.code)
      let log = state.log
      if (action.crit) log = addLog(log, 'crit', `⚡ Crítico: +${lines} líneas sin un solo typo. Sospechoso.`)
      if (code >= contract.code) log = addLog(log, 'success', `✓ Build OK · ${contract.code} líneas · listo para git push`)
      return { ...state, code, log }
    }

    case 'deliver': {
      const { contract } = state
      if (!contract || state.code < contract.code) return state
      const { reward } = contract
      const xp = Math.round(reward.xp * xpMultiplier(state.skills.logicalThinking))
      return {
        ...state,
        money: state.money + reward.money,
        xp: state.xp + xp,
        rep: state.rep + reward.rep,
        code: 0, // el código no se acumula entre contratos (GDD §3)
        contract: null,
        notice: {
          kind: 'success',
          text: `${contract.client} pagó: +$${reward.money.toLocaleString('es-AR')} · +${xp} XP · +${reward.rep} ★`,
        },
        log: addLog(
          state.log,
          'success',
          `git push origin main → deploy exitoso 🚀 +$${reward.money.toLocaleString('es-AR')} · +${xp} XP · +${reward.rep} ★`,
        ),
      }
    }

    case 'tick': {
      const { contract } = state
      if (!contract || state.code >= contract.code) return state

      // 1. El equipo escribe código (GDD §5)
      const code = addCode(state.code, autoRate(state.developers) * action.elapsed, contract.code)
      // Si se completó en este mismo tick, el reloj se detiene: no puede fallar
      if (code >= contract.code) {
        return { ...state, code, log: addLog(state.log, 'success', `✓ Build OK · el equipo terminó ${contract.code} líneas`) }
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
        notice: {
          kind: 'error',
          text: `Se venció el plazo: ${contract.client} contrató a un primo. −$${lostMoney.toLocaleString('es-AR')} · −${FAILURE_REP_LOSS} ★ · +${gainedXp} XP por la experiencia`,
        },
        log: addLog(state.log, 'error', `✗ DeadlineExceededException en ${contract.id} (${Math.floor(code)}/${contract.code})`),
      }
    }

    case 'buySkill': {
      const skill = SKILLS.find((s) => s.id === action.skill)
      if (!skill) return state
      const level = state.skills[skill.id]
      const cost = skillCost(skill.baseCost, level)
      if (level >= skill.maxLevel || state.xp < cost) return state
      return {
        ...state,
        xp: state.xp - cost,
        skills: { ...state.skills, [skill.id]: level + 1 },
        log: addLog(state.log, 'info', `npm install ${skill.id}@${level + 1} · ${skill.effect}`),
      }
    }

    case 'reset':
      return action.state

    case 'dismissNotice':
      return { ...state, notice: null }

    case 'hireDeveloper': {
      if (state.developers >= ROOM_CAPACITY || state.money < DEVELOPER_PRICE) return state
      return {
        ...state,
        money: state.money - DEVELOPER_PRICE,
        developers: state.developers + 1,
        log: addLog(state.log, 'info', `sudo useradd dev-${state.developers + 1} · +2 líneas/seg automáticas`),
      }
    }
  }
}
