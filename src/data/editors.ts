// Editores de código: se compran con dinero y cambian toda la interfaz.
// Se suman de a uno, en el orden en que se compran.

export type EditorId = 'nano' | 'bloc' | 'notepad' | 'sublime' | 'vscode' | 'cladex'

/** Qué partes del IDE tiene cada editor */
export type EditorFeatures = {
  /** Colores en el código */
  syntax: boolean
  /** Números de línea */
  lineNumbers: boolean
  /** Explorador, pestañas, minimapa y barra de estado: el IDE "completo" */
  ideChrome: boolean
  /** Cómo se navega: atajos de Nano, menú de ventana o barra de actividad del IDE */
  nav: 'nano' | 'menu' | 'ide' | 'agent'
}

export type Editor = {
  id: EditorId
  name: string
  price: number
  /** Etapa mínima para instalarlo (índice en STAGES); si falta, desde el principio */
  minStage?: number
  /** Líneas extra por clic que suma este editor */
  clickBonus: number
  /** Probabilidad extra de crítico (0.05 = +5 %) */
  critBonus: number
  /** Cuánto multiplica un crítico las líneas del clic */
  critMultiplier: number
  /** Líneas por segundo automáticas que aporta el editor (autocompletado) */
  autoBonus: number
  bonusText: string
  features: EditorFeatures
}

export const EDITORS: Editor[] = [
  {
    id: 'nano',
    name: 'Nano',
    price: 0,
    clickBonus: 0,
    critBonus: 0,
    critMultiplier: 2,
    autoBonus: 0,
    bonusText: 'Sin mouse, sin colores, sin miedo',
    features: { syntax: false, lineNumbers: false, ideChrome: false, nav: 'nano' },
  },
  {
    id: 'bloc',
    name: 'Bloc de notas',
    price: 1500,
    clickBonus: 1,
    critBonus: 0,
    critMultiplier: 2,
    autoBonus: 0,
    bonusText: '+1 línea por clic: ¡ahora usás el mouse!',
    features: { syntax: false, lineNumbers: false, ideChrome: false, nav: 'menu' },
  },
  {
    id: 'notepad',
    name: 'Notepad',
    price: 6000,
    clickBonus: 1,
    critBonus: 0.05,
    critMultiplier: 2,
    autoBonus: 0,
    bonusText: 'Resaltado de sintaxis: +5 % de probabilidad de crítico',
    features: { syntax: true, lineNumbers: true, ideChrome: false, nav: 'menu' },
  },
  {
    id: 'sublime',
    name: 'Sublimado Text',
    price: 20000,
    clickBonus: 1,
    critBonus: 0.05,
    critMultiplier: 3,
    autoBonus: 0,
    bonusText: 'Multicursor: los críticos valen x3 en vez de x2',
    features: { syntax: true, lineNumbers: true, ideChrome: true, nav: 'ide' },
  },
  {
    id: 'vscode',
    name: 'Visual Estudio Code',
    price: 600_000,
    minStage: 1,
    clickBonus: 1,
    critBonus: 0.05,
    critMultiplier: 3,
    autoBonus: 1,
    bonusText: 'Autocompletado: +1 línea por segundo automática',
    features: { syntax: true, lineNumbers: true, ideChrome: true, nav: 'ide' },
  },
  {
    id: 'cladex',
    name: 'Cladex Code',
    price: 5_000_000,
    minStage: 2,
    clickBonus: 1,
    critBonus: 0.05,
    critMultiplier: 3,
    autoBonus: 4,
    bonusText: 'Agente IA: +4 líneas por segundo automáticas. Vos mirás, él programa',
    features: { syntax: true, lineNumbers: false, ideChrome: false, nav: 'agent' },
  },
]

export function getEditor(id: EditorId): Editor {
  return EDITORS.find((e) => e.id === id) ?? EDITORS[0]
}

/** El siguiente editor a comprar, o null si ya tenés el último */
export function nextEditor(id: EditorId): Editor | null {
  const index = EDITORS.findIndex((e) => e.id === id)
  return EDITORS[index + 1] ?? null
}
