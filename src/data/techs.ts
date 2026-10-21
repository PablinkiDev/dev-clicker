// Árbol de tecnologías (GDD §7). Se aprenden y suben de nivel con XP.
// Las dependencias nuevas piden nivel 3 (GDD §7).
import { STAGES } from './stages'

export type TechId =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'node'
  | 'sql'
  | 'git'
  | 'ai'
  | 'angular'
  | 'nest'
  | 'python'
  | 'java'
  | 'mongo'

/** Lenguaje de un archivo de contrato */
export type Lang = 'html' | 'css' | 'js' | 'ts' | 'jsx' | 'node' | 'sql' | 'ng' | 'nest' | 'py' | 'java' | 'mongo'

/** Extensión del archivo de cada lenguaje (Node escribe .js, pero es otra tecnología) */
export const LANG_EXT: Record<Lang, string> = {
  html: 'html',
  css: 'css',
  js: 'js',
  ts: 'ts',
  jsx: 'jsx',
  node: 'js',
  sql: 'sql',
  ng: 'component.ts',
  nest: 'controller.ts',
  py: 'py',
  java: 'java',
  mongo: 'mongo.js',
}

export type Tech = {
  id: TechId
  name: string
  icon: string
  /** Costo en XP del primer nivel */
  baseCost: number
  maxLevel: number
  /** Tecnologías previas y el nivel que necesitan */
  requires: [TechId, number][]
  /** Multiplicador de paga y XP de sus contratos (las tecnologías más avanzadas pagan más). Las transversales no tienen */
  payTier?: number
  /** Etapa mínima de la empresa para aprenderla (índice en STAGES); si falta, desde el principio */
  minStage?: number
  effect: string
}

export const TECHS: Tech[] = [
  {
    id: 'html',
    name: 'HTML',
    icon: '<>',
    baseCost: 40,
    maxLevel: 5,
    requires: [],
    payTier: 1,
    effect: 'Contratos .html: paga ×1 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '#',
    baseCost: 40,
    maxLevel: 5,
    requires: [],
    payTier: 1,
    effect: 'Contratos .css: paga ×1 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'JS',
    baseCost: 80,
    maxLevel: 5,
    requires: [
      ['html', 1],
      ['css', 1],
    ],
    payTier: 1.3,
    effect: 'Contratos .js: paga ×1,3 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    payTier: 1.6,
    effect: 'Contratos .ts: paga ×1,6 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    payTier: 1.6,
    effect: 'Contratos .jsx: paga ×1,6 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'node',
    name: 'Node.js',
    icon: '⬢',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    payTier: 1.6,
    effect: 'Contratos de backend: paga ×1,6 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: '⛁',
    baseCost: 450,
    maxLevel: 5,
    requires: [['node', 1]],
    minStage: 2,
    payTier: 1.5,
    effect: 'Contratos .sql y fullstack: paga ×1,5 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'angular',
    name: 'Angular',
    icon: '▲',
    baseCost: 500,
    maxLevel: 5,
    requires: [['typescript', 3]],
    minStage: 2,
    payTier: 2,
    effect: 'Contratos .component.ts: paga ×2 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'nest',
    name: 'NestJS',
    icon: 'NS',
    baseCost: 600,
    maxLevel: 5,
    requires: [
      ['node', 3],
      ['typescript', 3],
    ],
    minStage: 3,
    payTier: 2.2,
    effect: 'Contratos de backend empresarial: paga ×2,2 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'Py',
    baseCost: 450,
    maxLevel: 5,
    requires: [['git', 1]],
    minStage: 2,
    payTier: 1.7,
    effect: 'Contratos .py: paga ×1,7 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    baseCost: 550,
    maxLevel: 5,
    requires: [['git', 3]],
    minStage: 3,
    payTier: 2,
    effect: 'Contratos .java: paga ×2 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  {
    id: 'mongo',
    name: 'MongoDB',
    icon: '🍃',
    baseCost: 550,
    maxLevel: 5,
    requires: [['node', 3]],
    minStage: 3,
    payTier: 1.8,
    effect: 'Contratos NoSQL: paga ×1,8 · +15 % de velocidad y +10 % de paga en ellos por nivel',
  },
  // Transversales: no tienen contratos propios, dan bonus a todo
  {
    id: 'git',
    name: 'Git',
    icon: '⎇',
    baseCost: 150,
    maxLevel: 5,
    requires: [
      ['html', 1],
      ['css', 1],
    ],
    minStage: 1,
    effect: '+10 % de producción automática por nivel (se acabó el final_final_v3.zip)',
  },
  {
    id: 'ai',
    name: 'IA asistida',
    icon: '✨',
    baseCost: 800,
    maxLevel: 5,
    requires: [
      ['git', 3],
      ['javascript', 3],
    ],
    minStage: 3,
    effect: '+10 % de líneas por clic por nivel (revisá lo que escribe)',
  },
]

export type TechLevels = Record<TechId, number>

/** Arrancás sabiendo HTML y CSS (GDD §7) */
export const INITIAL_TECH: TechLevels = {
  html: 1,
  css: 1,
  javascript: 0,
  typescript: 0,
  react: 0,
  node: 0,
  sql: 0,
  git: 0,
  ai: 0,
  angular: 0,
  nest: 0,
  python: 0,
  java: 0,
  mongo: 0,
}

/** Qué tecnología pide cada lenguaje de contrato */
export const LANG_TECH: Record<Lang, TechId> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  ts: 'typescript',
  jsx: 'react',
  node: 'node',
  sql: 'sql',
  ng: 'angular',
  nest: 'nest',
  py: 'python',
  java: 'java',
  mongo: 'mongo',
}

/**
 * Requisitos que todavía faltan para aprender una tecnología, como texto
 * ("JavaScript Nv.3" o "etapa Startup"), o null si no falta nada.
 */
export function missingRequirements(tech: Tech, levels: TechLevels, stage: number): string | null {
  const missing = tech.requires
    .filter(([id, level]) => levels[id] < level)
    .map(([id, level]) => `${TECHS.find((t) => t.id === id)?.name} Nv.${level}`)
  const minStage = tech.minStage ?? 0
  if (stage < minStage) missing.push(`etapa ${STAGES[minStage].name}`)
  return missing.length ? missing.join(' y ') : null
}

/**
 * Especialización (D3): cada nivel de la tecnología de un contrato por encima del 1
 * escribe sus líneas un 15 % más rápido. Así conviene especializarse en un stack.
 */
export function specialtyBonus(levels: TechLevels, lang: Lang = 'html'): number {
  return 1 + 0.15 * Math.max(0, levels[LANG_TECH[lang]] - 1)
}

/** Multiplicador de paga de un contrato: el de su tecnología, +25 % por cada tecnología extra del stack */
export function payTier(lang: Lang = 'html', stack: TechId[] = []): number {
  const tier = TECHS.find((t) => t.id === LANG_TECH[lang])?.payTier ?? 1
  return tier * (1 + 0.25 * stack.length)
}
