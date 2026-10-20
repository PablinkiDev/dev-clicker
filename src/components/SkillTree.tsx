/** Un nodo del árbol: dónde va (columna y fila), qué hace y cómo está */
export type TreeNode = {
  id: string
  col: number
  row: number
  icon: string
  iconClass?: string
  name: string
  effect: string
  level: number
  maxLevel: number
  /** Costo del siguiente nivel, ya con su moneda ("135 XP", "2 tokens") */
  cost: string
  /** Si falta algo, qué falta ("Requiere Node.js Nv.3"); null si no */
  missing: string | null
  /** Se puede comprar ahora mismo */
  affordable: boolean
}

/** Una línea entre dos nodos; active = el requisito ya se cumple */
export type TreeEdge = { from: string; to: string; active: boolean }

type SkillTreeProps = {
  nodes: TreeNode[]
  edges: TreeEdge[]
  /** Títulos de las columnas, como carpetas: "fundamentos/" */
  columns: string[]
  /** Comprar el siguiente nivel del nodo */
  onBuy: (id: string) => void
}

// Medidas en px: las líneas se calculan con las mismas, sin medir el DOM
const NODE_W = 256
const NODE_H = 160
const GAP_X = 56
const GAP_Y = 18
const HEADER = 26

const x = (col: number) => col * (NODE_W + GAP_X)
const y = (row: number) => HEADER + row * (NODE_H + GAP_Y)

/**
 * Árbol de mejoras: cada nodo es una tarjeta que se compra con un clic, y las líneas (SVG)
 * muestran qué pide qué. Es genérico: lo usan todos los árboles de Mejoras.
 */
function SkillTree({ nodes, edges, columns, onBuy }: SkillTreeProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const width = x(columns.length - 1) + NODE_W
  const height = y(Math.max(...nodes.map((n) => n.row))) + NODE_H

  return (
    // El árbol puede ser más ancho que la pantalla: se desplaza de costado
    <div className="mb-5 overflow-x-auto pb-2">
      <div className="relative" style={{ width, height }}>
        {columns.map((title, i) => (
          <p key={i} className="absolute top-0 font-mono text-[11px] text-faint" style={{ left: x(i), width: NODE_W }}>
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
          const isMax = n.level >= n.maxLevel
          let foot = `${n.level === 0 ? 'Aprender' : `Mejorar a Nv.${n.level + 1}`} · ${n.cost}`
          let footClass = n.affordable ? 'text-purple' : 'text-faint'
          if (isMax) {
            foot = '✓ Nivel máximo'
            footClass = 'text-yellow'
          } else if (n.missing) {
            foot = `🔒 ${n.missing}`
            footClass = 'text-faint'
          }

          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onBuy(n.id)}
              disabled={!n.affordable}
              title={n.missing ?? undefined}
              className={`absolute flex flex-col rounded-xl border bg-panel-2 p-3 text-left transition-colors disabled:cursor-default ${
                n.affordable
                  ? 'cursor-pointer border-purple/60 shadow-[0_0_0_3px_rgba(199,146,234,.12)] hover:border-purple hover:bg-purple/10'
                  : isMax
                    ? 'border-yellow/40'
                    : n.level > 0
                      ? 'border-green/45'
                      : 'border-line'
              } ${n.missing && !isMax ? 'opacity-50' : ''}`}
              style={{ left: x(n.col), top: y(n.row), width: NODE_W, height: NODE_H }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg bg-panel-3 font-mono text-sm font-extrabold ${n.iconClass ?? ''}`}
                >
                  {n.icon}
                </span>
                <span className="min-w-0 flex-1 text-sm leading-tight font-bold">{n.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted">
                  {n.level}/{n.maxLevel}
                </span>
              </span>
              <span className="mt-1.5 line-clamp-3 text-[11.5px] leading-snug text-muted">{n.effect}</span>
              <span className="mt-auto flex gap-0.5 pt-2.5">
                {Array.from({ length: n.maxLevel }, (_, i) => (
                  <i
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < n.level ? (isMax ? 'bg-yellow' : 'bg-green') : 'bg-panel'}`}
                  />
                ))}
              </span>
              <span className={`mt-1.5 truncate font-mono text-[11px] font-bold ${footClass}`}>{foot}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SkillTree
