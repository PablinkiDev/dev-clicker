// Árbol de tecnologías (GDD §7). Se aprenden y suben de nivel con XP.
// Por ahora solo las que tienen contratos; TypeScript, React y Node llegan con los suyos.

export type TechId = 'html' | 'css' | 'javascript'

/** Lenguaje de un archivo de contrato */
export type Lang = 'html' | 'css' | 'js'

export type Tech = {
  id: TechId
  name: string
  icon: string
  /** Costo en XP del primer nivel */
  baseCost: number
  maxLevel: number
  /** Tecnologías previas y el nivel que necesitan */
  requires: [TechId, number][]
  effect: string
}

export const TECHS: Tech[] = [
  { id: 'html', name: 'HTML', icon: '<>', baseCost: 40, maxLevel: 5, requires: [], effect: '+10 % de dinero por nivel en contratos .html' },
  { id: 'css', name: 'CSS', icon: '#', baseCost: 40, maxLevel: 5, requires: [], effect: '+10 % de dinero por nivel en contratos .css' },
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
]

export type TechLevels = Record<TechId, number>

/** Arrancás sabiendo HTML y CSS (GDD §7) */
export const INITIAL_TECH: TechLevels = { html: 1, css: 1, javascript: 0 }

/** Qué tecnología pide cada lenguaje de contrato */
export const LANG_TECH: Record<Lang, TechId> = { html: 'html', css: 'css', js: 'javascript' }

/** Requisitos que todavía faltan para aprender una tecnología, como texto ("JavaScript Nv.3"), o null si no falta nada */
export function missingRequirements(tech: Tech, levels: TechLevels): string | null {
  const missing = tech.requires
    .filter(([id, level]) => levels[id] < level)
    .map(([id, level]) => `${TECHS.find((t) => t.id === id)?.name} Nv.${level}`)
  return missing.length ? missing.join(' y ') : null
}
