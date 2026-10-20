import type { ReactNode } from 'react'

// Resaltado de sintaxis mínimo para HTML, CSS y JS/TS: alcanza para que el editor se vea vivo.
// Cada grupo de la expresión regular es un tipo de token, en este orden:
//   1 comentario · 2 etiqueta · 3 texto entre comillas · 4 atributo · 5 selector · 6 número · 7 palabra clave
const TOKEN =
  /(<!--.*?-->|\/\*.*?\*\/)|(<\/?[\w!-]+|\/?>)|("[^"]*"|'[^']*')|([\w-]+)(?==)|([.#@][\w-]+)|(\b\d+(?:\.\d+)?(?:px|rem|s|%|deg)?\b)|(!important|\b(?:display|transform|animation|background|cursor|padding|font-size|z-index|opacity|gap|border-radius|const|let|function|return|if|else|async|await|import|export|from|interface|type|new|try|catch)\b)/g

// Cada color usa una variable --syn-* (definida por el editor en index.css) y, si no existe, la paleta común
const CLASSES = [
  'text-(--syn-comment,var(--color-faint)) italic', // comentario
  'text-(--syn-tag,var(--color-red))', // etiqueta
  'text-(--syn-string,var(--color-green))', // texto entre comillas
  'text-(--syn-attr,var(--color-yellow))', // atributo
  'text-(--syn-attr,var(--color-yellow))', // selector
  'text-(--syn-number,var(--color-orange))', // número
  'text-(--syn-keyword,var(--color-cyan))', // palabra clave / propiedad
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
