// Habilidades del árbol personal (GDD §8) y del empresarial (GDD §9). Valores experimentales.
import { STAGES } from './stages'

export type SkillId =
  | 'fastTyping'
  | 'criticalCode'
  | 'logicalThinking'
  | 'focus'
  | 'shortcuts'
  | 'timeManagement'
  | 'hawkEye'
  | 'negotiator'
  | 'devastatingCrit'
  | 'muscleMemory'
  | 'flowState'
  | 'lucky'
  | 'hackathon'
  | 'crunch'
  | 'pairProgramming'
  | 'doubleCoffee'
  | 'teamwork'
  | 'knowledge'
  | 'autoDeliver'
  | 'autoAccept'
  | 'marketing'
  | 'codeReview'
  | 'kubernetes'
  | 'headhunter'
  | 'homeOffice'
  | 'investors'

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
  // --- Mejoras personales por etapa (D12): siempre hay algo tuyo para comprar ---
  {
    id: 'shortcuts',
    name: 'Atajos de teclado',
    icon: '⌘',
    effect: '+10 % de líneas por clic por nivel (Ctrl+C, Ctrl+V, Ctrl+Z, repetir)',
    baseCost: 1500,
    maxLevel: 5,
    group: 'personal',
    requires: [['fastTyping', 5]],
    minStage: 1,
  },
  {
    id: 'timeManagement',
    name: 'Gestión del tiempo',
    icon: '⏱',
    effect: '+8 % de plazo en los contratos nuevos por nivel',
    baseCost: 1200,
    maxLevel: 5,
    group: 'personal',
    requires: [['logicalThinking', 2]],
    minStage: 1,
  },
  {
    id: 'hawkEye',
    name: 'Ojo de halcón',
    icon: '🦅',
    effect: 'El bug dorado aparece 15 % más seguido y se queda 2 s más por nivel',
    baseCost: 6000,
    maxLevel: 3,
    group: 'personal',
    requires: [['focus', 1]],
    minStage: 2,
  },
  {
    id: 'negotiator',
    name: 'Negociador',
    icon: '💬',
    effect: '+5 % de paga en los contratos por nivel ("eso lleva más horas de lo que parece")',
    baseCost: 8000,
    maxLevel: 5,
    group: 'personal',
    requires: [['timeManagement', 1]],
    minStage: 2,
  },
  {
    id: 'devastatingCrit',
    name: 'Crítico devastador',
    icon: '💥',
    effect: 'Los críticos multiplican +0,5 más por nivel (×2 → ×2,5 → ×3)',
    baseCost: 30000,
    maxLevel: 2,
    group: 'personal',
    requires: [['criticalCode', 5]],
    minStage: 3,
  },
  {
    id: 'muscleMemory',
    name: 'Memoria muscular',
    icon: '🦾',
    effect: 'Cada clic suma además el 1 % de lo que produce tu equipo por segundo, por nivel',
    baseCost: 40000,
    maxLevel: 5,
    group: 'personal',
    requires: [['shortcuts', 3]],
    minStage: 3,
  },
  {
    id: 'flowState',
    name: 'Flow state',
    icon: '🧘',
    effect: 'La Concentración pasa de ×2 a ×3',
    baseCost: 120000,
    maxLevel: 1,
    group: 'personal',
    requires: [['hawkEye', 1]],
    minStage: 4,
  },
  {
    id: 'lucky',
    name: 'Suerte de programador',
    icon: '🍀',
    effect: '+10 % de chance de ganar las apuestas de los eventos y más eventos buenos, por nivel',
    baseCost: 100000,
    maxLevel: 3,
    group: 'personal',
    requires: [['negotiator', 1]],
    minStage: 4,
  },
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
  // --- Habilidades activas (F2): se usan con botones o teclas; el nivel las mejora ---
  {
    id: 'hackathon',
    name: 'Hackatón',
    icon: '🏃',
    effect: 'Habilidad activa (tecla 2): clics ×5 durante 10 s (+5 s por nivel). Recarga: 5 min',
    baseCost: 2000,
    maxLevel: 3,
    group: 'personal',
    requires: [['focus', 2]],
    minStage: 1,
  },
  {
    id: 'crunch',
    name: 'Crunch',
    icon: '🔥',
    effect:
      'Habilidad activa (tecla 3): equipo ×3 durante 30 s, después se cansa 30 s (menos con cada nivel). Recarga: 4 min',
    baseCost: 9000,
    maxLevel: 3,
    group: 'personal',
    requires: [['hackathon', 1]],
    minStage: 2,
  },
  {
    id: 'pairProgramming',
    name: 'Pair programming',
    icon: '👯',
    effect:
      'Habilidad activa (tecla 4): durante 20 s, cada clic suma 1 s de producción del equipo (+0,5 s por nivel). Recarga: 3 min',
    baseCost: 9000,
    maxLevel: 3,
    group: 'personal',
    requires: [['hackathon', 1]],
    minStage: 2,
  },
  {
    id: 'doubleCoffee',
    name: 'Café doble',
    icon: '☕',
    effect:
      'Habilidad activa (tecla 5): recarga al instante todas las demás y el Foco. Recarga: 10 min (−2 min por nivel)',
    baseCost: 35000,
    maxLevel: 3,
    group: 'personal',
    requires: [['focus', 4]],
    minStage: 3,
  },
  // --- Árbol Empresa ampliado (E3) ---
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📣',
    effect: '+1 ★ de reputación por contrato entregado, por nivel',
    baseCost: 400,
    maxLevel: 3,
    group: 'company',
    minStage: 1,
  },
  {
    id: 'codeReview',
    name: 'Code review obligatorio',
    icon: '🔍',
    effect: 'Tus QA dan +25 % más de XP por nivel ("LGTM" ya no alcanza)',
    baseCost: 600,
    maxLevel: 4,
    group: 'company',
    requires: [['knowledge', 2]],
    minStage: 1,
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    effect: 'Tus DevOps rinden +20 % más por nivel (nadie entiende el YAML, pero anda)',
    baseCost: 3000,
    maxLevel: 5,
    group: 'company',
    requires: [['teamwork', 3]],
    minStage: 2,
  },
  {
    id: 'headhunter',
    name: 'Headhunter',
    icon: '🎯',
    effect: 'En cada búsqueda, un candidato más por nivel viene con +1 ★',
    baseCost: 4000,
    maxLevel: 3,
    group: 'company',
    requires: [['marketing', 1]],
    minStage: 2,
  },
  {
    id: 'homeOffice',
    name: 'Home office',
    icon: '🏡',
    effect: '+2 puestos en tu oficina por nivel (la mitad trabaja desde la cama)',
    baseCost: 20000,
    maxLevel: 2,
    group: 'company',
    requires: [['kubernetes', 1]],
    minStage: 3,
  },
  {
    id: 'investors',
    name: 'Inversores',
    icon: '💰',
    effect: 'El dinero que tenés rinde 0,5 % por minuto por nivel (no cuenta como ganado)',
    baseCost: 25000,
    maxLevel: 4,
    group: 'company',
    requires: [['headhunter', 1]],
    minStage: 3,
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
  marketing: 0,
  codeReview: 0,
  kubernetes: 0,
  headhunter: 0,
  homeOffice: 0,
  investors: 0,
  shortcuts: 0,
  timeManagement: 0,
  hawkEye: 0,
  negotiator: 0,
  devastatingCrit: 0,
  muscleMemory: 0,
  flowState: 0,
  lucky: 0,
  hackathon: 0,
  crunch: 0,
  pairProgramming: 0,
  doubleCoffee: 0,
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
