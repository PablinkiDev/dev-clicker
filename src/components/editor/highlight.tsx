import type { ReactNode } from 'react'

// Resaltado de sintaxis mínimo para HTML y CSS: alcanza para que el editor se vea vivo.
// Cada grupo de la expresión regular es un tipo de token, en este orden:
//   1 comentario · 2 etiqueta · 3 texto entre comillas · 4 atributo · 5 selector · 6 número · 7 palabra clave
const TOKEN =
  /(<!--.*?-->|\/\*.*?\*\/)|(<\/?[\w!-]+|\/?>)|("[^"]*"|'[^']*')|([\w-]+)(?==)|([.#@][\w-]+)|(\b\d+(?:\.\d+)?(?:px|rem|s|%|deg)?\b)|(!important|\b(?:display|transform|animation|background|cursor|padding|font-size|z-index|opacity|gap|border-radius)\b)/g

const CLASSES = [
  'text-faint italic', // comentario
  'text-red', // etiqueta
  'text-green', // texto entre comillas
  'text-yellow', // atributo
  'text-yellow', // selector
  'text-orange', // número
  'text-cyan', // palabra clave / propiedad
]

export function highlight(line: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of line.matchAll(TOKEN)) {
    const start = match.index
    if (start > last) nodes.push(line.slice(last, start))

    // Buscamos qué grupo coincidió para elegir el color
    const group = match.slice(1).findIndex((g) => g !== undefined)
    nodes.push(
      <span key={start} className={CLASSES[group]}>
        {match[0]}
      </span>,
    )
    last = start + match[0].length
  }

  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}
