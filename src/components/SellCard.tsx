import { useState } from 'react'
import { formatDuration, formatMoney } from '../game/format'
import { BASE_TOKENS, milestoneValue, nextMilestone, tokensForValue } from '../game/prestige'
import type { Stats } from '../game/reducer'

type SellCardProps = {
  /** Valor de la empresa: dinero ganado + equipo */
  value: number
  stats: Stats
  teamSize: number
  onSell: () => void
}

/** Venta de la empresa: resumen, tokens que se ganan y confirmación en dos pasos */
function SellCard({ value, stats, teamSize, onSell }: SellCardProps) {
  // Primer clic: muestra la confirmación. Segundo clic: vende. Es irreversible
  const [confirming, setConfirming] = useState(false)
  const tokens = tokensForValue(value)
  const target = nextMilestone(value)
  const from = tokens === BASE_TOKENS ? 0 : milestoneValue(tokens - BASE_TOKENS - 1)
  const ratio = Math.min(1, (value - from) / (target - from))

  return (
    <div className="mt-4 max-w-xl rounded-xl border border-purple/45 bg-panel-2 p-3.5">
      <p className="font-mono text-[10px] font-bold tracking-wider text-purple uppercase">Venta de la empresa</p>
      <p className="font-extrabold">💼 Vendé y arrancá de cero, con ventajas</p>
      <p className="mb-3 text-xs text-muted">
        Se reinicia todo (dinero, XP, equipo, oficinas, editores, tecnologías y mejoras). Te quedan los tokens de
        inversión.
      </p>

      <dl className="mb-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-muted">Dinero ganado</dt>
        <dd className="text-right">{formatMoney(stats.moneyEarned)}</dd>
        <dt className="text-muted">Contratos entregados / vencidos</dt>
        <dd className="text-right">
          {stats.contractsDone} / {stats.contractsFailed}
        </dd>
        <dt className="text-muted">Empleados</dt>
        <dd className="text-right">{teamSize}</dd>
        <dt className="text-muted">Tiempo jugado</dt>
        <dd className="text-right">{formatDuration(stats.playTime)}</dd>
        <dt className="text-muted">Valor de la empresa (dinero ganado + equipo)</dt>
        <dd className="text-right font-bold text-yellow">{formatMoney(value)}</dd>
        <dt className="font-bold text-text">Tokens que ganás</dt>
        <dd className="text-right font-bold text-purple">+{tokens}</dd>
      </dl>

      <p className="mb-1 flex justify-between font-mono text-xs">
        <span className="text-muted">+1 token cuando el valor de la empresa llegue a {formatMoney(target)}</span>
        <span>{Math.floor(ratio * 100)}%</span>
      </p>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-panel-3">
        <div className="h-full bg-purple transition-[width] duration-500" style={{ width: `${ratio * 100}%` }} />
      </div>

      {confirming ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSell}
            className="flex-1 cursor-pointer rounded-lg bg-red py-2 text-sm font-extrabold text-[#2b0a0a]"
          >
            Sí, vender por +{tokens} tokens
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="cursor-pointer rounded-lg bg-panel-3 px-4 py-2 text-sm font-bold"
          >
            Mejor no
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full cursor-pointer rounded-lg border border-purple/50 bg-purple/15 py-2 font-mono text-sm font-bold text-purple transition-colors hover:bg-purple/25"
        >
          Vender empresa
        </button>
      )}
    </div>
  )
}

export default SellCard
