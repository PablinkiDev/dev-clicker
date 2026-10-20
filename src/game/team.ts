// Equipo: empleados con estrellas, sus fórmulas y la generación de candidatos.
import { NAMES, ROLES, type RoleId } from '../data/roles'

export type Employee = {
  uid: string
  role: RoleId
  /** Calidad de 1 a 5 (GDD §5) */
  stars: number
  name: string
  quirk: string
}

/** Precio: crece más rápido que las estrellas (una de 3★ cuesta ~6 veces una de 1★) */
export function employeePrice(role: RoleId, stars: number): number {
  return Math.round((ROLES[role].basePrice * Math.pow(stars, 1.6)) / 100) * 100
}

/** Líneas por segundo de un Desarrollador: 1★ → 2, 2★ → 5,3, 3★ → 9,3 */
export function devRate(stars: number): number {
  return Math.round(2 * Math.pow(stars, 1.4) * 10) / 10
}

/** +10 % de XP por cada estrella de QA */
export const QA_XP_PER_STAR: number = 0.1

/** +25 % de producción automática por cada estrella de DevOps */
export const OPS_AUTO_PER_STAR: number = 0.25

/** Suma algo de los empleados de una profesión (por ejemplo, sus estrellas) */
function sumRole(team: Employee[], role: RoleId, fn: (stars: number) => number): number {
  return team.filter((e) => e.role === role).reduce((total, e) => total + fn(e.stars), 0)
}

/** Lo que aporta una persona, en texto para las tarjetas */
export function employeeEffect(role: RoleId, stars: number): string {
  if (role === 'dev') return `+${devRate(stars).toLocaleString('es-AR')} líneas/seg automáticas`
  if (role === 'qa') return `+${Math.round(QA_XP_PER_STAR * stars * 100)}% de XP por contrato`
  return `+${Math.round(OPS_AUTO_PER_STAR * stars * 100)}% producción automática`
}

/** Producción automática total: (desarrolladores + editor) × bonus de DevOps */
export function autoRate(team: Employee[], editorBonus: number): number {
  const base = sumRole(team, 'dev', devRate) + editorBonus
  return base * (1 + sumRole(team, 'ops', (s) => OPS_AUTO_PER_STAR * s))
}

/** Multiplicador de XP que aporta QA */
export function qaMultiplier(team: Employee[]): number {
  return 1 + sumRole(team, 'qa', (s) => QA_XP_PER_STAR * s)
}

// --- Candidatos ---------------------------------------------------------------
// Usan azar, así que se generan afuera del reducer (igual que las ofertas).

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Probabilidad de cada cantidad de estrellas (1★ a 5★) según la etapa de la empresa.
 * Freelancer llega a 3★, Estudio y Startup a 4★, y desde Empresa tecnológica aparecen las 5★.
 */
export const STAR_ODDS: number[][] = [
  [0.6, 0.3, 0.1, 0, 0],
  [0.4, 0.35, 0.2, 0.05, 0],
  [0.2, 0.35, 0.3, 0.15, 0],
  [0.1, 0.25, 0.35, 0.2, 0.1],
  [0.05, 0.15, 0.3, 0.3, 0.2],
]

/** Estrellas al azar con las probabilidades de la etapa */
function randomStars(stage: number): number {
  const odds = STAR_ODDS[Math.min(stage, STAR_ODDS.length - 1)]
  let r = Math.random()
  for (let i = 0; i < odds.length; i++) {
    r -= odds[i]
    if (r < 0) return i + 1
  }
  return 1
}

/** Estrellas máximas que pueden aparecer en una etapa */
export function maxStars(stage: number): number {
  return STAR_ODDS[Math.min(stage, STAR_ODDS.length - 1)].findLastIndex((p) => p > 0) + 1
}

/** Un candidato nuevo, con un nombre que no esté ya en uso */
export function createCandidate(role: RoleId, taken: Employee[], stage: number, stars = randomStars(stage)): Employee {
  const used = new Set(taken.map((e) => e.name))
  const free = NAMES.filter((n) => !used.has(n))
  return {
    uid: crypto.randomUUID(),
    role,
    stars,
    name: free.length > 0 ? pickRandom(free) : 'Alex',
    quirk: pickRandom(ROLES[role].quirks),
  }
}

/** Candidatos iniciales: siempre hay un dev 1★ para el primer objetivo */
export function createInitialCandidates(team: Employee[] = []): Employee[] {
  const result: Employee[] = []
  for (const [role, stars] of [['dev', 1], ['qa'], ['ops'], ['dev']] as const) {
    result.push(createCandidate(role, [...team, ...result], 0, stars))
  }
  return result
}

/** Precio de "Buscar otros": una lista nueva de candidatos */
export const REROLL_PRICE: number = 100

/** Lista nueva de candidatos, todos al azar (el dev 1★ asegurado es solo para el arranque) */
export function rerollCandidates(team: Employee[], stage: number): Employee[] {
  const result: Employee[] = []
  for (const role of ['dev', 'qa', 'ops', 'dev'] as const)
    result.push(createCandidate(role, [...team, ...result], stage))
  return result
}

/** Al contratar a alguien, su lugar en la lista lo ocupa un candidato nuevo de la misma profesión */
export function replaceCandidate(candidates: Employee[], hired: Employee, team: Employee[], stage: number): Employee[] {
  const taken = [...team, ...candidates, hired]
  return candidates.map((c) => (c.uid === hired.uid ? createCandidate(hired.role, taken, stage) : c))
}
