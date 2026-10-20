// Habilidades del árbol personal (GDD §8) y del empresarial (GDD §9). Valores experimentales.
import { STAGES } from './stages'

export type SkillId =
  'fastTyping' | 'criticalCode' | 'logicalThinking' | 'focus' | 'teamwork' | 'knowledge' | 'autoDeliver' | 'autoAccept'

export type Skill = {
  id: SkillId
  name: string
  icon: string
  effect: string
  /** Costo en XP del primer nivel */
  baseCost: number
  maxLevel: number
  /** personal: mejoras tuyas (GDD §8) · company: mejoras de la empresa (GDD §9) */
  group: 'personal' | 'company'
  /** Etapa mínima para comprarla (índice en STAGES); si falta, desde el principio */
  minStage?: number
  /** Otras habilidades que hacen falta y en qué nivel (forman el árbol) */
  requires?: [SkillId, number][]
}

export const SKILLS: Skill[] = [
  {
    id: 'fastTyping',
    name: 'Escritura veloz',
    icon: '⌨',
    effect: '+1 línea por clic por nivel',
    baseCost: 30,
    maxLevel: 5,
    group: 'personal',
  },
  {
    id: 'criticalCode',
    name: 'Código crítico',
    icon: '⚡',
    effect: '+2 % de probabilidad de crítico (x2 líneas) por nivel',
    baseCost: 75,
    maxLevel: 5,
    group: 'personal',
    requires: [['fastTyping', 1]],
  },
  {
    id: 'logicalThinking',
    name: 'Pensamiento lógico',
    icon: '🧠',
    effect: '+5 % de XP por contrato por nivel',
    baseCost: 100,
    maxLevel: 5,
    group: 'personal',
  },
  {
    id: 'focus',
    name: 'Concentración',
    icon: '🎯',
    effect: 'Activala para ×2 líneas por clic: 24 s (+9 s por nivel). Se recarga en 2 min',
    baseCost: 250,
    maxLevel: 5,
    group: 'personal',
    requires: [['fastTyping', 2]],
  },
  // Árbol empresarial: mejoras generales de la plantilla, desde Estudio
  {
    id: 'teamwork',
    name: 'Trabajo en equipo',
    icon: '🤜',
    effect: '+5 % de producción automática por nivel',
    baseCost: 150,
    maxLevel: 5,
    group: 'company',
    minStage: 1,
  },
  {
    id: 'knowledge',
    name: 'Gestión del conocimiento',
    icon: '📖',
    effect: '+5 % de XP por contrato por nivel (la wiki que nadie lee)',
    baseCost: 250,
    maxLevel: 5,
    group: 'company',
    minStage: 1,
  },
  // Automatización (GDD §9): se compra una sola vez
  {
    id: 'autoDeliver',
    name: 'Entrega continua',
    icon: '🤖',
    effect: 'Los contratos se entregan solos al completar el código (CI/CD, pero de verdad)',
    baseCost: 500,
    maxLevel: 1,
    group: 'company',
    requires: [['teamwork', 1]],
    minStage: 1,
  },
  {
    id: 'autoAccept',
    name: 'Captación automática',
    icon: '📨',
    effect: 'Acepta sola la oferta que mejor paga entre las que el equipo termina a tiempo',
    baseCost: 1500,
    maxLevel: 1,
    group: 'company',
    requires: [['autoDeliver', 1]],
    minStage: 2,
  },
]

export type SkillLevels = Record<SkillId, number>

export const INITIAL_SKILLS: SkillLevels = {
  fastTyping: 0,
  criticalCode: 0,
  logicalThinking: 0,
  focus: 0,
  teamwork: 0,
  knowledge: 0,
  autoDeliver: 0,
  autoAccept: 0,
}

/** Lo que falta para comprar una habilidad, como texto ("Escritura veloz Nv.1 y etapa Estudio"), o null */
export function missingSkillRequirements(skill: Skill, levels: SkillLevels, stage: number): string | null {
  const missing = (skill.requires ?? [])
    .filter(([id, level]) => levels[id] < level)
    .map(([id, level]) => `${SKILLS.find((s) => s.id === id)?.name} Nv.${level}`)
  const minStage = skill.minStage ?? 0
  if (stage < minStage) missing.push(`etapa ${STAGES[minStage].name}`)
  return missing.length ? missing.join(' y ') : null
}
