// Habilidades del árbol personal (GDD §8). Valores experimentales.

export type SkillId = 'fastTyping' | 'criticalCode' | 'logicalThinking'

export type Skill = {
  id: SkillId
  name: string
  icon: string
  effect: string
  /** Costo en XP del primer nivel */
  baseCost: number
  maxLevel: number
}

export const SKILLS: Skill[] = [
  {
    id: 'fastTyping',
    name: 'Escritura veloz',
    icon: '⌨',
    effect: '+1 línea por clic por nivel',
    baseCost: 30,
    maxLevel: 5,
  },
  {
    id: 'criticalCode',
    name: 'Código crítico',
    icon: '⚡',
    effect: '+2 % de probabilidad de crítico (x2 líneas) por nivel',
    baseCost: 75,
    maxLevel: 5,
  },
  {
    id: 'logicalThinking',
    name: 'Pensamiento lógico',
    icon: '🧠',
    effect: '+5 % de XP por contrato por nivel',
    baseCost: 100,
    maxLevel: 5,
  },
]

export type SkillLevels = Record<SkillId, number>

export const INITIAL_SKILLS: SkillLevels = { fastTyping: 0, criticalCode: 0, logicalThinking: 0 }
