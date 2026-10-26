// 🌌 Árbol de mejoras "constelación" (C10): nodos redondos con un anillo que se llena por nivel,
// repartidos en todo el ancho. Tocás un nodo y en el panel de detalle (a la derecha, o abajo en el
// celular) ves qué hace y lo comprás. Es genérico: lo usan todos los árboles de Mejoras.
import { useRef, useState, type Ref } from 'react'
import NewBadge from './NewBadge'

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
  /** 🆕 Recién desbloqueado y todavía no visto */
  isNew?: boolean
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

// Las columnas se reparten el ancho (en %); las filas tienen alto fijo (px)
const ROW_H = 100
const HEADER = 34
const ORB = 54
/** Un solo aro: es el borde del círculo y a la vez la barra de nivel */
const STROKE = 4
const RING_R = ORB / 2 - STROKE / 2
const RING = 2 * Math.PI * RING_R

type Status = 'buy' | 'max' | 'owned' | 'poor' | 'locked'

const statusOf = (n: TreeNode): Status =>
  n.level >= n.maxLevel ? 'max' : n.missing ? 'locked' : n.affordable ? 'buy' : n.level > 0 ? 'owned' : 'poor'

/** El aro de fondo (lo que falta llenar) toma el color del estado */
const TRACK_STYLE: Record<Status, string> = {
  buy: 'stroke-purple',
  max: 'stroke-yellow',
  owned: 'stroke-line-2',
  poor: 'stroke-line-2',
  locked: 'stroke-line-2',
}

function SkillTree({ nodes, edges, columns, onBuy }: SkillTreeProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  // Elegido al abrir: lo primero que se puede comprar (o lo primero)
  const [selectedId, setSelectedId] = useState(() => (nodes.find((n) => n.affordable) ?? nodes[0])?.id)
  const selected = byId.get(selectedId ?? '') ?? nodes[0]
  const detailRef = useRef<HTMLDivElement>(null)

  const x = (col: number) => `${((col + 0.5) / columns.length) * 100}%`
  const y = (row: number) => HEADER + row * ROW_H + ROW_H / 2
  const height = y(Math.max(...nodes.map((n) => n.row))) + ROW_H / 2 + 8

  function select(id: string) {
    setSelectedId(id)
    // En el celular el detalle queda abajo: se lleva a la vista
    if (window.matchMedia('(max-width: 1023px)').matches)
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start">
      <div
        className="relative w-full min-w-0 shrink-0 overflow-hidden rounded-2xl lg:flex-1 border border-line bg-panel bg-[radial-gradient(circle_at_30%_15%,var(--color-panel-3),transparent_70%)]"
        style={{ height }}
      >
        {columns.map((title, i) => (
          <span
            key={i}
            className="absolute top-2.5 -translate-x-1/2 font-mono text-[10.5px] whitespace-nowrap text-faint"
            style={{ left: x(i) }}
          >
            {title}
          </span>
        ))}

        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {edges.map(({ from, to, active }) => {
            const a = byId.get(from)
            const b = byId.get(to)
            if (!a || !b) return null
            // Verde solo si el destino está desbloqueado de verdad (también puede pedir etapa u otro requisito)
            const open = active && !b.missing
            return (
              <line
                key={`${from}-${to}`}
                x1={x(a.col)}
                y1={y(a.row)}
                x2={x(b.col)}
                y2={y(b.row)}
                strokeWidth={2}
                strokeDasharray={open ? undefined : '4 5'}
                className={open ? 'stroke-green/55' : 'stroke-line-2'}
              />
            )
          })}
        </svg>

        {nodes.map((n) => {
          const status = statusOf(n)
          const isSelected = n.id === selected?.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => select(n.id)}
              aria-pressed={isSelected}
              aria-label={`${n.name}, nivel ${n.level} de ${n.maxLevel}`}
              className="absolute flex w-[calc(100%/var(--cols))] -translate-x-1/2 -translate-y-[27px] cursor-pointer flex-col items-center gap-3 px-1"
              style={{ left: x(n.col), top: y(n.row), ['--cols' as string]: columns.length }}
            >
              <span
                className={`relative grid shrink-0 place-items-center rounded-full bg-panel-2 font-mono text-base font-extrabold ${status === 'buy' ? 'animate-glow' : ''} ${status === 'locked' ? 'opacity-40' : ''} ${
                  isSelected ? 'outline-2 outline-offset-4 outline-text' : ''
                } ${n.iconClass ?? ''}`}
                style={{ width: ORB, height: ORB }}
              >
                {/* Anillo de nivel: se llena con cada nivel comprado */}
                <svg
                  viewBox={`0 0 ${ORB} ${ORB}`}
                  className="pointer-events-none absolute inset-0 -rotate-90"
                  style={{ width: ORB, height: ORB }}
                  aria-hidden
                >
                  <circle
                    cx={ORB / 2}
                    cy={ORB / 2}
                    r={RING_R}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeDasharray={status === 'locked' ? '4 4' : undefined}
                    className={TRACK_STYLE[status]}
                  />
                  {/* Lo comprado: sin niveles no se dibuja (si no, queda un punto) */}
                  {n.level > 0 && status !== 'max' && (
                    <circle
                      cx={ORB / 2}
                      cy={ORB / 2}
                      r={RING_R}
                      fill="none"
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={`${(RING * n.level) / n.maxLevel} ${RING}`}
                      className="stroke-green"
                    />
                  )}
                </svg>
                {n.icon}
                {n.isNew && <NewBadge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap" />}
              </span>
              <span
                className={`line-clamp-2 text-center text-[10.5px] leading-tight ${isSelected ? 'font-bold text-text' : 'text-muted'} ${status === 'locked' ? 'opacity-50' : ''}`}
              >
                {n.name}{' '}
                <span className="font-mono text-faint">
                  {n.level}/{n.maxLevel}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {selected && <Detail ref={detailRef} node={selected} onBuy={() => onBuy(selected.id)} />}
    </div>
  )
}

/** El panel de detalle del nodo elegido: qué hace, su nivel y el botón de comprar */
function Detail({ node, onBuy, ref }: { node: TreeNode; onBuy: () => void; ref: Ref<HTMLDivElement> }) {
  const status = statusOf(node)
  let label = `${node.level === 0 ? 'Aprender' : `Mejorar a Nv.${node.level + 1}`} · ${node.cost}`
  if (status === 'max') label = '✓ Nivel máximo'
  else if (status === 'locked') label = 'Bloqueado'
  return (
    <div
      ref={ref}
      className="flex shrink-0 scroll-mb-28 flex-col gap-2.5 rounded-2xl border border-line-2 bg-panel-2 p-4 lg:sticky lg:top-2 lg:w-80"
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-xl bg-panel-3 font-mono text-lg font-extrabold ${node.iconClass ?? ''}`}
        >
          {node.icon}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-extrabold">
            {node.name} {node.isNew && <NewBadge />}
          </p>
          <p className="font-mono text-[11px] text-muted">
            Nivel {node.level} de {node.maxLevel}
          </p>
        </div>
      </div>
      <span className="flex gap-0.5">
        {Array.from({ length: node.maxLevel }, (_, i) => (
          <i
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < node.level ? (status === 'max' ? 'bg-yellow' : 'bg-green') : 'bg-panel'}`}
          />
        ))}
      </span>
      <p className="text-[13px] leading-snug text-muted">{node.effect}</p>
      {status === 'locked' && <p className="font-mono text-xs text-faint">🔒 {node.missing}</p>}
      <button
        type="button"
        onClick={onBuy}
        disabled={status !== 'buy'}
        className={`mt-1 cursor-pointer rounded-xl py-2.5 text-sm font-extrabold disabled:cursor-default ${
          status === 'buy'
            ? 'bg-purple text-[#1d0b2b] hover:brightness-110'
            : status === 'max'
              ? 'bg-yellow/15 text-yellow'
              : 'bg-panel-3 text-faint'
        }`}
      >
        {label}
      </button>
      {status === 'poor' || status === 'owned' ? (
        <p className="-mt-1 text-center font-mono text-[11px] text-faint">Todavía no te alcanza</p>
      ) : null}
    </div>
  )
}

export default SkillTree
