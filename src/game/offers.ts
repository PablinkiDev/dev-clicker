// Generador de ofertas: funciones que arman el tablón a partir de las plantillas.
import { CONTRACT_TEMPLATES, GUIDED_CONTRACT } from '../data/contracts'
import { LANG_TECH, type TechLevels } from '../data/techs'
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
  return {
    ...template,
    uid: crypto.randomUUID(),
    code: Math.round(template.code * factor * scale),
    time: Math.round(template.time * (1 + 0.2 * stage) * (1 + 0.05 * level)),
    reward: {
      money: Math.round((template.reward.money * factor * scale * (STAGES[stage].payScale ?? 1)) / 5) * 5,
      xp: Math.round(template.reward.xp * factor * Math.pow(scale, 0.75)),
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
  const ctx: OfferContext = { tech, stage: 0, endless: 0, rep: 0 }
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

  return result
}
