// Límites razonables para una partida cargada (de localStorage o de un archivo importado).
// La validación de save.ts revisa los TIPOS; acá se revisan los RANGOS: un número bien escrito
// pero absurdo (un dev de 50★, JavaScript Nv.99) se recorta al máximo posible en vez de romper el juego.
import { INVESTMENTS } from '../data/investments'
import { cleanCompany, cleanProfile } from '../data/personalization'
import { MACRO_LEVELS } from '../data/macro'
import { getCard, type CardPick } from '../data/cards'
import { getChallenge } from '../data/challenges'
import { OFFICES, officeCapacity } from '../data/offices'
import { SKILLS } from '../data/skills'
import { STAGES } from '../data/stages'
import { TECHS } from '../data/techs'
import type { GameState } from './reducer'
import { INBOX_LIMIT, INITIAL_INBOX, type Inbox, type InboxItem } from './inbox'
import type { Employee } from './team'

/** Recorta un número a [min, max]; si no es un número válido, devuelve min */
function clamp(value: number, min: number, max = Infinity): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

/** Niveles enteros entre 0 y el máximo de cada mejora */
function clampLevels<K extends string>(levels: Record<K, number>, items: { id: K; maxLevel: number }[]) {
  const result = { ...levels }
  for (const item of items) result[item.id] = Math.round(clamp(levels[item.id], 0, item.maxLevel))
  return result
}

const clampEmployee = (e: Employee): Employee => ({ ...e, stars: Math.round(clamp(e.stars, 1, 5)) })

const isCard = (c: unknown): c is CardPick =>
  typeof c === 'object' && c !== null && 'id' in c && typeof c.id === 'string' && getCard(c.id) !== undefined

export function sanitize(state: GameState): GameState {
  const office = Math.round(clamp(state.office, 0, OFFICES.length - 1))
  return {
    ...state,
    money: clamp(state.money, 0),
    xp: clamp(state.xp, 0),
    rep: clamp(state.rep, 0),
    code: clamp(state.code, 0),
    timeLeft: clamp(state.timeLeft, 0),
    stage: Math.round(clamp(state.stage, 0, STAGES.length - 1)),
    endless: Math.round(clamp(state.endless, 0)),
    office,
    skills: clampLevels(state.skills, SKILLS),
    tech: clampLevels(state.tech, TECHS),
    // Si hay más empleados de los que entran en la oficina, se quedan los primeros
    team: state.team
      .slice(0, officeCapacity(office, Math.min(2, Math.max(0, Math.round(state.skills.homeOffice) || 0))))
      .map(clampEmployee),
    candidates: state.candidates.map(clampEmployee),
    stats: {
      moneyEarned: clamp(state.stats.moneyEarned, 0),
      contractsDone: Math.round(clamp(state.stats.contractsDone, 0)),
      contractsFailed: Math.round(clamp(state.stats.contractsFailed, 0)),
      playTime: clamp(state.stats.playTime, 0),
      xpEarned: clamp(state.stats.xpEarned, 0),
      specialsDone: Math.round(clamp(state.stats.specialsDone, 0)),
      badEvents: Math.round(clamp(state.stats.badEvents, 0)),
    },
    contractClicks: Math.round(clamp(state.contractClicks, 0)),
    rerolls: Math.round(clamp(state.rerolls, 0, 50)),
    macro: Math.round(clamp(state.macro, 0, MACRO_LEVELS.length)),
    macroOn: state.macroOn !== false,
    tampered: state.tampered === true,
    // Solo cartas que existen (una partida editada o vieja podría traer cualquier cosa)
    cards: Array.isArray(state.cards) ? state.cards.filter(isCard) : [],
    cardOffer: Array.isArray(state.cardOffer) && state.cardOffer.every(isCard) ? state.cardOffer : null,
    combo: { count: clamp(state.combo?.count, 0), lastAt: clamp(state.combo?.lastAt, 0) },
    bossCountdown: Math.round(clamp(state.bossCountdown, 0, 100)),
    challenge: getChallenge(state.challenge) ? state.challenge : null,
    challengeChoice: state.challengeChoice === true,
    // 🎨 Nombre corto y solo opciones que existen (y que ya desbloqueaste)
    company: cleanCompany(state.company),
    profile: cleanProfile(state.profile, state.records.unlocked),
    inbox: cleanInbox(state.inbox),
    records: {
      ...state.records,
      ...Object.fromEntries(
        (
          [
            'clicks',
            'crits',
            'lines',
            'contracts',
            'specials',
            'replacements',
            'betsWon',
            'bugs',
            'minigames',
            'bosses',
            'boxes',
            'boxesBought',
            'ipoAt',
            'goodStreak',
            'pets',
          ] as const
        ).map((key) => [key, clamp(state.records[key], 0)]),
      ),
    },
    prestige: {
      ...state.prestige,
      tokens: Math.round(clamp(state.prestige.tokens, 0)),
      sales: Math.round(clamp(state.prestige.sales, 0)),
      investments: clampLevels(state.prestige.investments, INVESTMENTS),
      history: state.prestige.history.map((sale) =>
        sale.company === undefined ? sale : { ...sale, company: cleanCompany(sale.company) },
      ),
    },
  }
}

/** 🔔 Solo notificaciones bien formadas, con texto corto (una partida editada podría traer cualquier cosa) */
function cleanInbox(inbox: Inbox | undefined): Inbox {
  if (typeof inbox !== 'object' || inbox === null || !Array.isArray(inbox.items)) return INITIAL_INBOX
  const kinds = ['good', 'bad', 'info', 'gold']
  const items = inbox.items
    .filter(
      (n): n is InboxItem =>
        typeof n === 'object' &&
        n !== null &&
        Number.isFinite(n.id) &&
        typeof n.icon === 'string' &&
        typeof n.text === 'string' &&
        kinds.includes(n.kind),
    )
    .slice(-INBOX_LIMIT)
    .map((n) => ({ ...n, icon: [...n.icon].slice(0, 4).join(''), text: n.text.slice(0, 160) }))
  return { items, seen: clamp(inbox.seen, 0) }
}
