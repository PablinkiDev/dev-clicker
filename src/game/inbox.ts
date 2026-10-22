// 🔔 H2: centro de notificaciones. Después de cada acción se compara el antes y el después y se anota
// lo importante (logros, ascensos, jefes, cajas, eventos…), para que nada se pierda si no estabas mirando.
import { ACHIEVEMENTS } from '../data/achievements'
import { RARITIES, getArtifact } from '../data/artifacts'
import { FEATURES } from '../data/features'
import { STAGES } from '../data/stages'
import type { GameAction, GameState } from './reducer'

export type InboxKind = 'good' | 'bad' | 'info' | 'gold'

export type InboxItem = { id: number; icon: string; text: string; kind: InboxKind }

export type Inbox = {
  items: InboxItem[]
  /** Id de la última notificación vista: las de id mayor son nuevas */
  seen: number
}

export const INITIAL_INBOX: Inbox = { items: [], seen: 0 }

/** Cuántas se guardan (las más viejas se borran) */
export const INBOX_LIMIT = 60

/** Las notificaciones que todavía no viste */
export const unreadCount = (inbox: Inbox) => inbox.items.filter((n) => n.id > inbox.seen).length

/** Qué pasó con esta acción que valga la pena anotar */
function whatHappened(prev: GameState, next: GameState, action: GameAction): Omit<InboxItem, 'id'>[] {
  const found: Omit<InboxItem, 'id'>[] = []
  const boxes = next.records.boxes - prev.records.boxes
  const plusBoxes = boxes > 0 ? ` · +${boxes} 📦` : ''

  if (action.type === 'sell') {
    const tokens = next.prestige.tokens - prev.prestige.tokens
    found.push({ icon: '💼', text: `Vendiste ${prev.company.name} · +${tokens} tokens${plusBoxes}`, kind: 'gold' })
  } else if (next.stage > prev.stage) {
    found.push({
      icon: STAGES[next.stage].icon,
      text: `Ascendiste: ahora sos ${STAGES[next.stage].name}`,
      kind: 'gold',
    })
  }

  // 👹 Jefes: ganados y perdidos
  const boss = prev.contract?.boss ? prev.contract : null
  if (boss && next.records.bosses > prev.records.bosses)
    found.push({ icon: '👹', text: `Venciste a ${boss.client}${plusBoxes}`, kind: 'gold' })
  else if (next.stats.contractsFailed > prev.stats.contractsFailed && prev.contract)
    found.push({
      icon: boss ? '👹' : '⌛',
      text: boss ? `${boss.client} se fue sin pagar` : `Se venció "${prev.contract.title}"`,
      kind: 'bad',
    })
  else if (boxes > 0 && action.type !== 'sell')
    found.push({ icon: '📦', text: `+${boxes} caja${boxes > 1 ? 's' : ''} de suministros`, kind: 'good' })

  if (action.type === 'openBox') {
    const artifact = getArtifact(action.artifact)
    const level = next.records.artifacts[action.artifact] ?? 0
    if (artifact && level > (prev.records.artifacts[action.artifact] ?? 0))
      found.push({
        icon: artifact.icon,
        text: `${RARITIES[artifact.rarity].name}: ${artifact.name}${level > 1 ? ` sube a Nv.${level}` : ' (¡nuevo!)'}`,
        kind: artifact.rarity === 'epic' || artifact.rarity === 'legendary' ? 'gold' : 'good',
      })
  }
  if (action.type === 'applyEvent')
    found.push({ icon: action.icon, text: action.text, kind: action.tone === 'bad' ? 'bad' : 'info' })
  if (action.type === 'intern' && next.notice)
    found.push({ icon: '🎓', text: next.notice.text.replace(/^🎓 /, ''), kind: action.surprise ? 'good' : 'bad' })
  if (action.type === 'minigame')
    found.push({
      icon: '🎮',
      text: `Minijuego: ${Math.round(action.score * 3)} de 3`,
      kind: action.score > 0 ? 'good' : 'info',
    })
  if (next.records.ipoAt > 0 && prev.records.ipoAt === 0)
    found.push({ icon: '🦄', text: `¡${next.company.name} salió a la bolsa!`, kind: 'gold' })

  // 🏆 Logros y 🔓 funcionalidades nuevas
  for (const id of next.records.unlocked.slice(prev.records.unlocked.length)) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    if (a) found.push({ icon: '🏆', text: `Logro: ${a.icon} ${a.name}`, kind: 'gold' })
  }
  for (const id of next.records.features.slice(prev.records.features.length)) {
    const f = FEATURES.find((x) => x.id === id)
    if (f) found.push({ icon: '🔓', text: `Nuevo: ${f.icon} ${f.name}`, kind: 'info' })
  }
  return found
}

/** Agrega a la bandeja lo que pasó (la bandeja es de la carrera: sobrevive a las ventas) */
export function notify(prev: GameState, next: GameState, action: GameAction): GameState {
  const base = action.type === 'sell' ? prev.inbox : next.inbox
  const found = whatHappened(prev, next, action)
  if (found.length === 0) return base === next.inbox ? next : { ...next, inbox: base }
  let id = base.items.at(-1)?.id ?? base.seen
  const items = [...base.items, ...found.map((n) => ({ ...n, id: ++id }))].slice(-INBOX_LIMIT)
  return { ...next, inbox: { ...base, items } }
}
