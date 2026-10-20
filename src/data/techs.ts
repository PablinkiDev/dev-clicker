// Árbol de tecnologías (GDD §7). Se aprenden y suben de nivel con XP.
// Las dependencias nuevas piden nivel 3 (GDD §7).
import { STAGES } from './stages'

export type TechId = 'html' | 'css' | 'javascript' | 'typescript' | 'react' | 'node' | 'sql'

/** Lenguaje de un archivo de contrato */
export type Lang = 'html' | 'css' | 'js' | 'ts' | 'jsx' | 'node' | 'sql'

/** Extensión del archivo de cada lenguaje (Node escribe .js, pero es otra tecnología) */
export const LANG_EXT: Record<Lang, string> = {
  html: 'html',
  css: 'css',
  js: 'js',
  ts: 'ts',
  jsx: 'jsx',
  node: 'js',
  sql: 'sql',
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
    effect: '+10 % de dinero por nivel en contratos .html',
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '#',
    baseCost: 40,
    maxLevel: 5,
    requires: [],
    effect: '+10 % de dinero por nivel en contratos .css',
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
    effect: 'Desbloquea contratos .js · +10 % de dinero por nivel en ellos',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    effect: 'Desbloquea contratos .ts · +10 % de dinero por nivel en ellos',
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    effect: 'Desbloquea contratos .jsx · +10 % de dinero por nivel en ellos',
  },
  {
    id: 'node',
    name: 'Node.js',
    icon: '⬢',
    baseCost: 400,
    maxLevel: 5,
    requires: [['javascript', 3]],
    minStage: 2,
    effect: 'Desbloquea contratos de backend · +10 % de dinero por nivel en ellos',
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: '⛁',
    baseCost: 450,
    maxLevel: 5,
    requires: [['node', 1]],
    minStage: 2,
    effect: 'Desbloquea contratos .sql y fullstack · +10 % de dinero por nivel en ellos',
  },
]

export type TechLevels = Record<TechId, number>

/** Arrancás sabiendo HTML y CSS (GDD §7) */
export const INITIAL_TECH: TechLevels = { html: 1, css: 1, javascript: 0, typescript: 0, react: 0, node: 0, sql: 0 }

/** Qué tecnología pide cada lenguaje de contrato */
export const LANG_TECH: Record<Lang, TechId> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  ts: 'typescript',
  jsx: 'react',
  node: 'node',
  sql: 'sql',
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
