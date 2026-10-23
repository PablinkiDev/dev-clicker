// 💼 Modo infinito + venta de la empresa (H5): el valor en grande, cuánto falta para el próximo token
// y el botón de vender, con confirmación en dos pasos (es irreversible).
import { useState } from 'react'
import { formatDuration, formatMoney } from '../game/format'
import { BASE_TOKENS, milestoneValue, nextMilestone, tokensForValue } from '../game/prestige'
import type { Stats } from '../game/reducer'
import { ENDLESS_GROWTH } from '../game/stages'

type SellCardProps = {
  /** Valor de la empresa: dinero ganado + equipo */
  value: number
  stats: Stats
  teamSize: number
  /** 🏢 Nombre de la empresa (G4) */
  companyName: string
  /** ♾️ Multiplicador actual de los contratos y contratos entregados en modo infinito */
  scale: number
  endless: number
  onSell: () => void
}

function SellCard({ value, stats, teamSize, companyName, scale, endless, onSell }: SellCardProps) {
  // Primer clic: muestra la confirmación. Segundo clic: vende
  const [confirming, setConfirming] = useState(false)
  const tokens = tokensForValue(value)
  const target = nextMilestone(value)
  const from = tokens === BASE_TOKENS ? 0 : milestoneValue(tokens - BASE_TOKENS - 1)
  const ratio = Math.min(1, (value - from) / (target - from))

  const boxes: [string, string, string][] = [
    ['Tokens que ganás', `+${tokens}`, 'text-purple'],
    ['Contratos', `${stats.contractsDone} / ${stats.contractsFailed}`, 'text-text'],
    ['Tiempo jugado', formatDuration(stats.playTime), 'text-text'],
  ]

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-purple/45 bg-linear-to-b from-purple/12 to-panel-2 p-4">
      <p className="font-mono text-[10px] font-bold tracking-wider text-purple uppercase">
        ♾️ Modo infinito · venta de la empresa
      </p>
      <div>
        <p className="text-xs text-muted">Valor de {companyName}</p>
        <p className="font-mono text-3xl font-extrabold tracking-tight text-yellow">{formatMoney(value)}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-3">
          <div className="h-full bg-purple transition-[width] duration-500" style={{ width: `${ratio * 100}%` }} />
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted">
          +1 token a {formatMoney(target)} · cada contrato agranda los próximos un{' '}
          {Math.round((ENDLESS_GROWTH - 1) * 100)} % (×{scale.toLocaleString('es-AR', { maximumFractionDigits: 1 })},{' '}
          {endless} en modo infinito)
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {boxes.map(([label, text, color]) => (
          <div key={label} className="rounded-xl border border-line bg-panel px-2.5 py-2">
            <dt className="truncate text-[11px] text-muted">{label}</dt>
            <dd className={`font-mono text-lg font-extrabold ${color}`}>{text}</dd>
          </div>
        ))}
      </dl>
      <div>
        {confirming ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onSell}
              className="flex-1 cursor-pointer rounded-xl bg-red py-2.5 text-sm font-extrabold text-[#2b0a0a]"
            >
              Sí, vender por +{tokens} tokens
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="cursor-pointer rounded-xl bg-panel-3 px-4 py-2.5 text-sm font-bold"
            >
              Mejor no
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-full cursor-pointer rounded-xl bg-purple py-2.5 text-sm font-extrabold text-[#1d0b2b] hover:brightness-110"
          >
            💼 Vender {companyName}
          </button>
        )}
      </div>
      <p className="text-xs text-muted">
        Se reinicia la empresa (dinero, XP, {teamSize} empleados, oficinas, editores, tecnologías y mejoras). Te quedan
        los tokens, los artefactos, tu perfil y tu carrera.
      </p>
    </div>
  )
}

export default SellCard
