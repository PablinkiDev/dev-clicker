// Generador de ofertas: funciones que arman el tablón a partir de las plantillas.
import { CONTRACT_TEMPLATES, GUIDED_CONTRACT } from '../data/contracts'
import type { Contract, ContractTemplate, Difficulty } from './types'

/** Cantidad de ofertas visibles (GDD §4: de 3 a 5 según reputación; por ahora fijo) */
export const BOARD_SIZE: number = 3

/** Un mismo cliente no vuelve a ofrecer trabajo hasta pasado este tiempo (GDD §4: 3–5 min) */
export const CLIENT_COOLDOWN_MS: number = 3 * 60 * 1000

/** Hasta cuándo está en cooldown cada plantilla (id → timestamp) */
export type Cooldowns = Record<string, number>

const DIFFICULTIES: Difficulty[] = ['easy', 'mid', 'hard']

/** Crea una oferta concreta: misma plantilla, con ±15 % de variación en código y pago */
function createOffer(template: ContractTemplate): Contract {
  const factor = template.once ? 1 : 0.85 + Math.random() * 0.3
  return {
    ...template,
    uid: crypto.randomUUID(),
    code: Math.round(template.code * factor),
    reward: {
      money: Math.round((template.reward.money * factor) / 5) * 5,
      xp: Math.round(template.reward.xp * factor),
      rep: template.reward.rep,
    },
  }
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Tablón inicial: el contrato guiado + ofertas para completar */
export function createInitialOffers(): Contract[] {
  return refillOffers([createOffer(GUIDED_CONTRACT)], {}, null, Date.now())
}

/**
 * Completa el tablón hasta BOARD_SIZE garantizando al menos una oferta
 * fácil, una media y una difícil. Nunca deja el tablón sin opciones:
 * si todos los clientes de una dificultad están en cooldown, ofrece uno igual.
 */
export function refillOffers(
  offers: Contract[],
  cooldowns: Cooldowns,
  activeId: string | null,
  now: number,
): Contract[] {
  const result = [...offers]

  const available = (difficulty?: Difficulty, ignoreCooldown = false) =>
    CONTRACT_TEMPLATES.filter(
      (t) =>
        (!difficulty || t.difficulty === difficulty) &&
        !result.some((o) => o.id === t.id) &&
        t.id !== activeId &&
        (ignoreCooldown || (cooldowns[t.id] ?? 0) <= now),
    )

  for (const difficulty of DIFFICULTIES) {
    if (result.some((o) => o.difficulty === difficulty)) continue
    let candidates = available(difficulty)
    if (candidates.length === 0) candidates = available(difficulty, true)
    if (candidates.length > 0) result.push(createOffer(pickRandom(candidates)))
  }

  while (result.length < BOARD_SIZE) {
    let candidates = available()
    if (candidates.length === 0) candidates = available(undefined, true)
    if (candidates.length === 0) break
    result.push(createOffer(pickRandom(candidates)))
  }

  return result
}
