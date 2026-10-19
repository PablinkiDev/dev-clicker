// Editores de código: se compran con dinero y cambian toda la interfaz.
// Por ahora existen Nano y Bloc de notas; el resto se suma de a uno.

export type EditorId = 'nano' | 'bloc'

/** Qué partes del IDE tiene cada editor */
export type EditorFeatures = {
  /** Colores en el código */
  syntax: boolean
  /** Números de línea */
  lineNumbers: boolean
  /** Explorador, pestañas, minimapa y barra de estado: el IDE "completo" */
  ideChrome: boolean
}

export type Editor = {
  id: EditorId
  name: string
  price: number
  /** Líneas extra por clic que suma este editor */
  clickBonus: number
  bonusText: string
  features: EditorFeatures
}

export const EDITORS: Editor[] = [
  {
    id: 'nano',
    name: 'Nano',
    price: 0,
    clickBonus: 0,
    bonusText: 'Sin mouse, sin colores, sin miedo',
    features: { syntax: false, lineNumbers: false, ideChrome: false },
  },
  {
    id: 'bloc',
    name: 'Bloc de notas',
    price: 250,
    clickBonus: 1,
    bonusText: '+1 línea por clic: ¡ahora usás el mouse!',
    features: { syntax: false, lineNumbers: false, ideChrome: false },
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
