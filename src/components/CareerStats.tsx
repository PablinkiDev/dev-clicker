// 📊 H3: estadísticas de toda tu carrera, con gráficos de cada empresa vendida.
import { useState } from 'react'
import { ARTIFACTS } from '../data/artifacts'
import { ACHIEVEMENTS } from '../data/achievements'
import { formatDuration, formatMoney, formatNumber } from '../game/format'
import { careerPlayTime, tokensEarned, type SaleRecord } from '../game/prestige'
import type { GameState } from '../game/reducer'

type BarDatum = { label: string; value: number; detail: string }

/**
 * Barras de una sola serie (un color, sin leyenda: el título dice qué es). Marcas finas con la punta
 * redondeada, grilla tenue y un globito al pasar el mouse (o tocar) cada barra.
 */
function BarChart({
  title,
  data,
  color,
  format,
}: {
  title: string
  data: BarDatum[]
  color: string
  format: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.value), 1)
  const W = 100 / data.length
  return (
    <figure className="rounded-xl border border-line bg-panel-2 p-3.5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-extrabold">{title}</span>
        <span className="font-mono text-[11px] text-muted">máx. {format(max)}</span>
      </figcaption>
      <div className="relative h-36" onMouseLeave={() => setHover(null)}>
        {/* Grilla tenue: mitad y tope */}
        {[0.5, 1].map((f) => (
          <span
            key={f}
            className="absolute right-0 left-0 border-t border-dashed border-line"
            style={{ bottom: `${f * 100}%` }}
          />
        ))}
        <span className="absolute right-0 bottom-0 left-0 border-t border-line-2" />
        {data.map((d, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${d.label}: ${format(d.value)}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            className="absolute bottom-0 flex h-full cursor-default items-end justify-center px-[2px]"
            style={{ left: `${i * W}%`, width: `${W}%` }}
          >
            <span
              className={`block w-full max-w-7 rounded-t-[4px] transition-opacity ${hover !== null && hover !== i ? 'opacity-45' : ''}`}
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, background: color }}
            />
          </button>
        ))}
        {hover !== null && (
          <span
            className="pointer-events-none absolute -top-2 z-10 w-max max-w-48 -translate-x-1/2 -translate-y-full rounded-lg border border-line-2 bg-panel-3 px-2.5 py-1.5 font-mono text-[11px] shadow-xl"
            style={{ left: `${Math.min(85, Math.max(15, (hover + 0.5) * W))}%` }}
          >
            <b className="block text-text">{data[hover].label}</b>
            <span className="text-muted">{data[hover].detail}</span>
          </span>
        )}
      </div>
      <div className="mt-1 flex font-mono text-[10px] text-faint">
        {data.map((_, i) => (
          <span key={i} className="truncate text-center" style={{ width: `${W}%` }}>
            {data.length <= 12 || i % 2 === 0 ? i + 1 : ''}
          </span>
        ))}
      </div>
    </figure>
  )
}

const companyLabel = (sale: SaleRecord, i: number) => sale.company?.name ?? `Empresa n.º ${i + 1}`

function CareerStats({ state }: { state: GameState }) {
  const { records, prestige, stats } = state
  // Las ventas, de la primera a la última (el historial guarda la más reciente primero)
  const sales = [...prestige.history].reverse()
  const timed = sales.filter((s) => s.playTime)

  const totals: [string, string][] = [
    ['⏱ Tiempo jugado', formatDuration(careerPlayTime(prestige, stats.playTime))],
    ['💼 Empresas vendidas', String(prestige.sales)],
    ['🖱 Clics', formatNumber(records.clicks)],
    ['⚡ Críticos', formatNumber(records.crits)],
    ['📝 Líneas escritas', formatNumber(records.lines)],
    ['📄 Contratos entregados', formatNumber(records.contracts)],
    ['👹 Jefes vencidos', String(records.bosses)],
    ['🐛 Bugs dorados', String(records.bugs)],
    ['🎮 Minijuegos', String(records.minigames)],
    ['🎲 Apuestas ganadas', String(records.betsWon)],
    ['🪙 Tokens ganados', String(tokensEarned(prestige))],
    ['🏆 Logros', `${records.unlocked.length}/${ACHIEVEMENTS.length}`],
    ['🏺 Artefactos', `${Object.keys(records.artifacts).length}/${ARTIFACTS.length}`],
    ['🐾 Caricias a la mascota', String(records.pets)],
  ]

  return (
    <div className="max-w-4xl">
      <p className="mb-2.5 font-mono text-xs text-muted">tu-carrera/</p>
      <dl className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {totals.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
            <dt className="truncate text-[11px] text-muted">{label}</dt>
            <dd className="font-mono text-lg font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mb-2.5 font-mono text-xs text-muted">empresas-vendidas/</p>
      {sales.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-2 p-4 text-sm text-muted">
          Cuando vendas tu primera empresa, acá vas a ver cuánto tardaste y cuánto ganaste con cada una.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {timed.length > 0 && (
            <BarChart
              title="Duración de cada empresa"
              color="var(--color-cyan)"
              format={(n) => formatDuration(n)}
              data={timed.map((s) => ({
                label: companyLabel(s, sales.indexOf(s)),
                value: s.playTime ?? 0,
                detail: `${formatDuration(s.playTime ?? 0)} · ${s.contractsDone} contratos`,
              }))}
            />
          )}
          <BarChart
            title="Tokens de cada venta"
            color="var(--color-purple)"
            format={(n) => `${n} tokens`}
            data={sales.map((s, i) => ({
              label: companyLabel(s, i),
              value: s.tokens,
              detail: `+${s.tokens} tokens · vendida por ${formatMoney(s.value)}`,
            }))}
          />
        </div>
      )}
    </div>
  )
}

export default CareerStats
