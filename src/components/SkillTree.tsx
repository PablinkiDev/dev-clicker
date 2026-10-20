import type { ReactNode } from 'react'

/** Un nodo del árbol: dónde va (columna y fila) y cómo está */
export type TreeNode = {
  id: string
  col: number
  row: number
  icon: string
  iconClass?: string
  name: string
  level: number
  maxLevel: number
  /** Falta un requisito: se ve apagado */
  locked: boolean
  /** Se puede comprar ahora mismo: se resalta */
  affordable: boolean
}

/** Una línea entre dos nodos; active = el requisito ya se cumple */
export type TreeEdge = { from: string; to: string; active: boolean }

type SkillTreeProps = {
  nodes: TreeNode[]
  edges: TreeEdge[]
  /** Títulos de las columnas, como carpetas: "fundamentos/" */
  columns: string[]
  selected: string | null
  onSelect: (id: string) => void
  /** Detalle del nodo elegido (la tarjeta con el botón de comprar) */
  children?: ReactNode
}

// Medidas en px: las líneas se calculan con las mismas, sin medir el DOM
const NODE_W = 172
const NODE_H = 58
const GAP_X = 52
const GAP_Y = 16
const HEADER = 26

const x = (col: number) => col * (NODE_W + GAP_X)
const y = (row: number) => HEADER + row * (NODE_H + GAP_Y)

/**
 * Árbol de mejoras: nodos en una grilla y líneas (SVG) que muestran qué pide qué.
 * Es genérico: lo usan las tecnologías y los demás árboles.
 */
function SkillTree({ nodes, edges, columns, selected, onSelect, children }: SkillTreeProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const width = x(columns.length - 1) + NODE_W
  const height = y(Math.max(...nodes.map((n) => n.row))) + NODE_H

  return (
    <div className="mb-5">
      {/* El árbol puede ser más ancho que la pantalla: se desplaza de costado */}
      <div className="overflow-x-auto pb-2">
        <div className="relative" style={{ width, height }}>
          {columns.map((title, i) => (
            <p
              key={title}
              className="absolute top-0 font-mono text-[11px] text-faint"
              style={{ left: x(i), width: NODE_W }}
            >
              {title}
            </p>
          ))}

          <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden>
            {edges.map(({ from, to, active }) => {
              const a = byId.get(from)
              const b = byId.get(to)
              if (!a || !b) return null
              // Del borde derecho del requisito al borde izquierdo del nodo, con una curva suave
              const x1 = x(a.col) + NODE_W
              const y1 = y(a.row) + NODE_H / 2
              const x2 = x(b.col)
              const y2 = y(b.row) + NODE_H / 2
              const mid = (x1 + x2) / 2
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray={active ? undefined : '4 4'}
                  className={active ? 'stroke-green/70' : 'stroke-line-2'}
                />
              )
            })}
          </svg>

          {nodes.map((n) => {
            const isSelected = n.id === selected
            const isMax = n.level >= n.maxLevel
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelect(n.id)}
                className={`absolute flex cursor-pointer items-center gap-2.5 rounded-xl border bg-panel-2 px-3 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan ring-2 ring-cyan/30'
                    : n.affordable
                      ? 'border-purple/60 hover:border-purple'
                      : n.level > 0
                        ? 'border-green/45 hover:border-green'
                        : 'border-line hover:border-line-2'
                } ${n.locked ? 'opacity-45' : ''}`}
                style={{ left: x(n.col), top: y(n.row), width: NODE_W, height: NODE_H }}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg bg-panel-3 font-mono text-xs font-extrabold ${n.iconClass ?? ''}`}
                >
                  {n.locked ? '🔒' : n.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{n.name}</span>
                  <span className="mt-1 flex gap-0.5">
                    {Array.from({ length: n.maxLevel }, (_, i) => (
                      <i
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < n.level ? (isMax ? 'bg-yellow' : 'bg-green') : 'bg-panel'}`}
                      />
                    ))}
                  </span>
                </span>
                {n.affordable && <span className="size-2 shrink-0 rounded-full bg-purple" title="Podés comprarla" />}
              </button>
            )
          })}
        </div>
      </div>

      {children && <ul className="mt-2 max-w-sm">{children}</ul>}
    </div>
  )
}

export default SkillTree
