// Generador de ofertas: funciones que arman el tablón a partir de las plantillas.
import { CONTRACT_TEMPLATES, GUIDED_CONTRACT } from '../data/contracts'
import { LANG_TECH, payTier, type TechLevels } from '../data/techs'
import { ASSUMED_CLICKS_PER_SECOND } from './formulas'
import { boardSize, repLevel, repScale } from './reputation'
import { STAGES } from '../data/stages'
import { contractScale } from './stages'
import type { Contract, ContractTemplate, Difficulty } from './types'

/** Todo lo que define cómo son las ofertas nuevas */
export type OfferContext = {
  tech: TechLevels
  /** Etapa de la empresa (índice en STAGES) */
  stage: number
  /** Contratos entregados en modo infinito */
  endless: number
  rep: number
  /**
   * Líneas por segundo que el jugador puede escribir hoy (clics supuestos + equipo).
   * Sirve para garantizar que siempre haya al menos una oferta posible.
   */
  perSecond: number
}

/** Un mismo cliente no vuelve a ofrecer trabajo hasta pasado este tiempo (GDD §4: 3–5 min) */
export const CLIENT_COOLDOWN_MS: number = 3 * 60 * 1000

/** Hasta cuándo está en cooldown cada plantilla (id → timestamp) */
export type Cooldowns = Record<string, number>

const DIFFICULTIES: Difficulty[] = ['easy', 'mid', 'hard']

/**
 * Crea una oferta concreta: misma plantilla, con ±15 % de variación y escalada según la etapa.
 * El código y el dinero crecen con contractScale; la XP crece más despacio (para no inflarla)
 * y el plazo se estira un poco, porque el equipo también es más grande.
 */
function createOffer(template: ContractTemplate, { stage, endless, rep }: OfferContext): Contract {
  const factor = template.once ? 1 : 0.85 + Math.random() * 0.3
  const level = repLevel(rep)
  // Etapa y reputación son grupos distintos: se multiplican
  const scale = contractScale(stage, endless) * repScale(level)
  // Las tecnologías avanzadas (y los fullstack) pagan más (D3)
  const tier = payTier(template.lang, template.stack)
  return {
    ...template,
    uid: crypto.randomUUID(),
    code: Math.round(template.code * factor * scale),
    // El plazo es FIJO (D2): lo que crece es el código. El jugador tiene que mejorar su producción
    time: template.time,
    reward: {
      money: Math.round((template.reward.money * factor * scale * tier * (STAGES[stage].payScale ?? 1)) / 5) * 5,
      xp: Math.round(template.reward.xp * factor * tier * Math.pow(scale, 0.75)),
      rep: template.reward.rep,
    },
  }
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Un contrato se puede ofrecer si sabés la tecnología de su lenguaje (y las de su stack, si es fullstack)
 * y la empresa está en su rango
 * de etapas: desde minStage hasta maxStage (por defecto, la etapa siguiente). Así en Corporación no
 * aparece la verdulería del barrio.
 */
export function canTake(template: ContractTemplate, tech: TechLevels, stage: number): boolean {
  const min = template.minStage ?? 0
  const max = template.maxStage ?? min + 1
  const knowsAll = [LANG_TECH[template.lang ?? 'html'], ...(template.stack ?? [])].every((id) => tech[id] > 0)
  return knowsAll && stage >= min && stage <= max
}

/**
 * Captación automática (GDD §9) con reglas seguras: solo considera las ofertas que el equipo
 * termina solo (sin clics) usando como mucho el 80 % del plazo, y elige la que mejor paga.
 */
export function pickAutoOffer(offers: Contract[], autoRate: number): Contract | null {
  if (autoRate <= 0) return null
  const viable = offers.filter((o) => o.code / autoRate <= o.time * 0.8)
  return viable.reduce<Contract | null>((best, o) => (!best || o.reward.money > best.reward.money ? o : best), null)
}

/** Tablón inicial: el contrato guiado + ofertas para completar */
export function createInitialOffers(tech: TechLevels): Contract[] {
  const ctx: OfferContext = { tech, stage: 0, endless: 0, rep: 0, perSecond: ASSUMED_CLICKS_PER_SECOND }
  return refillOffers([createOffer(GUIDED_CONTRACT, ctx)], {}, null, Date.now(), ctx)
}

/**
 * Completa el tablón (de 3 a 5 ofertas según la reputación) garantizando al menos una oferta
 * fácil, una media y una difícil. Nunca deja el tablón sin opciones:
 * si todos los clientes de una dificultad están en cooldown, ofrece uno igual.
 */
export function refillOffers(
  offers: Contract[],
  cooldowns: Cooldowns,
  activeId: string | null,
  now: number,
  ctx: OfferContext,
): Contract[] {
  const result = [...offers]
  const size = boardSize(repLevel(ctx.rep))

  const available = (difficulty?: Difficulty, ignoreCooldown = false) =>
    CONTRACT_TEMPLATES.filter(
      (t) =>
        (!difficulty || t.difficulty === difficulty) &&
        !result.some((o) => o.id === t.id) &&
        t.id !== activeId &&
        canTake(t, ctx.tech, ctx.stage) &&
        (ignoreCooldown || (cooldowns[t.id] ?? 0) <= now),
    )

  for (const difficulty of DIFFICULTIES) {
    if (result.some((o) => o.difficulty === difficulty)) continue
    let candidates = available(difficulty)
    if (candidates.length === 0) candidates = available(difficulty, true)
    if (candidates.length > 0) result.push(createOffer(pickRandom(candidates), ctx))
  }

  while (result.length < size) {
    let candidates = available()
    if (candidates.length === 0) candidates = available(undefined, true)
    if (candidates.length === 0) break
    result.push(createOffer(pickRandom(candidates), ctx))
  }

  return ensureViable(result, ctx.perSecond)
}

/** Una oferta es viable si se termina usando como mucho el 80 % del plazo */
const isViable = (offer: Contract, perSecond: number) => offer.code / perSecond <= offer.time * 0.8

/**
 * Anti-traba: si ninguna oferta se puede terminar a tiempo con la producción actual, la más
 * accesible se achica (código y paga en la misma proporción) hasta entrar en el 70 % del plazo.
 * Así la partida nunca queda sin opciones, aunque te hayas quedado atrás.
 */
function ensureViable(offers: Contract[], perSecond: number): Contract[] {
  if (perSecond <= 0 || offers.some((o) => isViable(o, perSecond))) return offers
  const easiest = offers.reduce((best, o) => (o.code / o.time < best.code / best.time ? o : best))
  const factor = (perSecond * easiest.time * 0.7) / easiest.code
  const shrunk: Contract = {
    ...easiest,
    code: Math.max(1, Math.round(easiest.code * factor)),
    reward: {
      ...easiest.reward,
      money: Math.max(5, Math.round((easiest.reward.money * factor) / 5) * 5),
      xp: Math.max(1, Math.round(easiest.reward.xp * factor)),
    },
  }
  return offers.map((o) => (o === easiest ? shrunk : o))
}
