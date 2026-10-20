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

/** 60 % 1★, 30 % 2★, 10 % 3★. Las 4★ y 5★ quedan para oficinas más grandes */
function randomStars(): number {
  const r = Math.random()
  return r < 0.6 ? 1 : r < 0.9 ? 2 : 3
}

/** Un candidato nuevo, con un nombre que no esté ya en uso */
export function createCandidate(role: RoleId, taken: Employee[], stars = randomStars()): Employee {
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
    result.push(createCandidate(role, [...team, ...result], stars))
  }
  return result
}

/** Al contratar a alguien, su lugar en la lista lo ocupa un candidato nuevo de la misma profesión */
export function replaceCandidate(candidates: Employee[], hired: Employee, team: Employee[]): Employee[] {
  const taken = [...team, ...candidates, hired]
  return candidates.map((c) => (c.uid === hired.uid ? createCandidate(hired.role, taken) : c))
}
