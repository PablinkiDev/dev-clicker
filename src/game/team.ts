// Equipo: empleados con estrellas, sus fórmulas y la generación de candidatos.
import { NAMES, ROLES, rolesFor, type RoleId } from '../data/roles'
import { STAGES } from '../data/stages'

export type Employee = {
  uid: string
  role: RoleId
  /** Calidad de 1 a 5 (GDD §5) */
  stars: number
  name: string
  quirk: string
}

/**
 * Precio: crece más rápido que las estrellas (una de 3★ cuesta ~6 veces una de 1★) y con la etapa:
 * en una empresa grande, los sueldos también lo son. Sin etapa, el precio base (para el valor de la empresa)
 */
export function employeePrice(role: RoleId, stars: number, stage = 0): number {
  return Math.round((ROLES[role].basePrice * Math.pow(stars, 1.6) * STAGES[stage].priceScale) / 100) * 100
}

/** Líneas por segundo de un Desarrollador: 1★ → 2, 2★ → 5,3, 3★ → 9,3 */
export function devRate(stars: number): number {
  return Math.round(2 * Math.pow(stars, 1.4) * 10) / 10
}

/** +10 % de XP por cada estrella de QA */
export const QA_XP_PER_STAR: number = 0.1

/** +25 % de producción automática por cada estrella de DevOps */
export const OPS_AUTO_PER_STAR: number = 0.25

/** 🎓 Un pasante escribe el 40 % de lo que escribe un dev de sus mismas estrellas */
export const INTERN_RATE: number = 0.4

/** 🎨 +6 % de paga por contrato por cada estrella de Diseño UX */
export const UX_PAY_PER_STAR: number = 0.06

/** 📋 +4 % de plazo por cada estrella de PM (como mucho +100 %) */
export const PM_TIME_PER_STAR: number = 0.04
const PM_TIME_MAX = 1

/** 📊 +0,2 de suerte (2 % más chances de lo bueno) por cada estrella de Data Scientist */
export const DATA_LUCK_PER_STAR: number = 0.2

/** 🧑‍🏫 +5 % a todo lo que hacen los demás, por cada estrella de Tech Lead */
export const LEAD_PER_STAR: number = 0.05

/** Suma algo de los empleados de una profesión (por ejemplo, sus estrellas) */
function sumRole(team: Employee[], role: RoleId, fn: (stars: number) => number): number {
  return team.filter((e) => e.role === role).reduce((total, e) => total + fn(e.stars), 0)
}

/** Líneas por segundo de un pasante */
export const internRate = (stars: number) => Math.round(INTERN_RATE * devRate(stars) * 10) / 10

/** 🧑‍🏫 Cuánto potencia el Tech Lead a los demás (1 si no hay) */
export function leadMultiplier(team: Employee[]): number {
  return 1 + sumRole(team, 'lead', (s) => LEAD_PER_STAR * s)
}

const pct = (n: number) => `${Math.round(n * 100)}%`

/** Lo que aporta una persona, en texto para las tarjetas */
export function employeeEffect(role: RoleId, stars: number): string {
  switch (role) {
    case 'dev':
      return `+${devRate(stars).toLocaleString('es-AR')} líneas/seg automáticas`
    case 'qa':
      return `+${pct(QA_XP_PER_STAR * stars)} de XP por contrato`
    case 'ops':
      return `+${pct(OPS_AUTO_PER_STAR * stars)} producción automática`
    case 'intern':
      return `+${internRate(stars).toLocaleString('es-AR')} líneas/seg · a veces mete un bug, a veces sorprende`
    case 'ux':
      return `+${pct(UX_PAY_PER_STAR * stars)} de paga por contrato`
    case 'pm':
      return `+${pct(PM_TIME_PER_STAR * stars)} de plazo en los contratos nuevos`
    case 'data':
      return `+${pct(DATA_LUCK_PER_STAR * stars * 0.1)} de chances en eventos y apuestas`
    case 'lead':
      return `+${pct(LEAD_PER_STAR * stars)} a todo lo que hacen los demás`
  }
}

/** Producción automática total: (desarrolladores + pasantes + editor) × bonus de DevOps, potenciado por el Tech Lead */
/** kubernetes: nivel de la mejora (+20 % al bonus de cada DevOps por nivel) */
export function autoRate(team: Employee[], editorBonus: number, kubernetes = 0): number {
  const lead = leadMultiplier(team)
  const base = (sumRole(team, 'dev', devRate) + sumRole(team, 'intern', internRate)) * lead + editorBonus
  return base * (1 + sumRole(team, 'ops', (s) => OPS_AUTO_PER_STAR * s) * (1 + 0.2 * kubernetes) * lead)
}

/** Multiplicador de XP que aporta QA */
/** codeReview: nivel de la mejora (+25 % al bonus de cada QA por nivel) */
export function qaMultiplier(team: Employee[], codeReview = 0): number {
  return 1 + sumRole(team, 'qa', (s) => QA_XP_PER_STAR * s) * (1 + 0.25 * codeReview) * leadMultiplier(team)
}

/** 🎨 Multiplicador de la paga que aporta Diseño UX */
export function uxMultiplier(team: Employee[]): number {
  return 1 + sumRole(team, 'ux', (s) => UX_PAY_PER_STAR * s) * leadMultiplier(team)
}

/** 📋 Multiplicador del plazo que aporta el PM (se aplica después de dimensionar el código) */
export function pmMultiplier(team: Employee[]): number {
  return 1 + Math.min(PM_TIME_MAX, sumRole(team, 'pm', (s) => PM_TIME_PER_STAR * s) * leadMultiplier(team))
}

/** 📊 Suerte que aporta Data Science (misma escala que la habilidad Suerte) */
export function dataLuck(team: Employee[]): number {
  return sumRole(team, 'data', (s) => DATA_LUCK_PER_STAR * s) * leadMultiplier(team)
}

// --- 🎓 Pasantes: a veces meten un bug, a veces sorprenden -------------------------

/** Cada cuánto hace algo un pasante: de 60 a 120 s */
export const nextInternDelay = () => (60 + Math.random() * 60) * 1000

/** Con más estrellas, sorprende más seguido: 1★ 40 %, 5★ 80 % */
export const internSurpriseChance = (stars: number) => 0.3 + 0.1 * stars

/** Qué parte del contrato suma (sorpresa) o resta (bug) */
export const internSwing = (stars: number, surprise: boolean) => (surprise ? 0.02 * stars : 0.015 * (6 - stars))

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
  for (const [role, stars] of [['dev', 1], ['qa'], ['ops'], ['intern'], ['dev']] as const) {
    result.push(createCandidate(role, [...team, ...result], 0, stars))
  }
  return result
}

/** Un candidato por cada profesión de la etapa (y un dev más mientras hay pocas) */
export function candidateRoles(stage: number): RoleId[] {
  const roles = rolesFor(stage)
  return roles.length < 6 ? [...roles, 'dev'] : roles
}

/** Precio base de "Buscar otros": una lista nueva de candidatos */
export const REROLL_PRICE: number = 100

/** Cuánto se encarece cada búsqueda seguida (vuelve al precio base al contratar a alguien) */
export const REROLL_GROWTH: number = 1.5

/** Precio de la próxima búsqueda: crece con la etapa y con cada búsqueda sin contratar */
export function rerollPrice(stage: number, rerolls: number): number {
  return Math.round((REROLL_PRICE * STAGES[stage].priceScale * Math.pow(REROLL_GROWTH, rerolls)) / 10) * 10
}

/** Lista nueva de candidatos, todos al azar (el dev 1★ asegurado es solo para el arranque) */
export function rerollCandidates(team: Employee[], stage: number, headhunter = 0): Employee[] {
  const result: Employee[] = []
  for (const role of candidateRoles(stage)) result.push(createCandidate(role, [...team, ...result], stage))
  // Headhunter: los primeros candidatos vienen con una estrella más (sin pasar el máximo de la etapa)
  const top = maxStars(stage)
  return result.map((c, i) => (i < headhunter ? { ...c, stars: Math.min(top, c.stars + 1) } : c))
}

/** Al contratar a alguien, su lugar en la lista lo ocupa un candidato nuevo de la misma profesión */
export function replaceCandidate(candidates: Employee[], hired: Employee, team: Employee[], stage: number): Employee[] {
  const taken = [...team, ...candidates, hired]
  return candidates.map((c) => (c.uid === hired.uid ? createCandidate(hired.role, taken, stage) : c))
}
