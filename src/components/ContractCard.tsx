import { formatMoney, formatNumber, formatTime } from '../game/format'
import type { Contract } from '../game/types'

type ContractCardProps = {
  contract: Contract
  code: number
  timeLeft: number
}

/** Tarjeta del contrato en curso, arriba del código (como un "peek" del editor) */
function ContractCard({ contract, code, timeLeft }: ContractCardProps) {
  const progress = (code / contract.code) * 100
  const timeRatio = timeLeft / contract.time
  const isComplete = code >= contract.code
  const isUrgent = !isComplete && timeRatio < 0.3

  return (
    <article className="mx-3 mt-2 mb-1 shrink-0 overflow-hidden rounded-xl border border-line-2 bg-linear-to-b from-panel-2 to-panel md:mx-4">
      <div className="flex items-start gap-3 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{contract.client} · cliente</p>
          <h2 className="truncate text-base font-extrabold tracking-tight md:text-lg">{contract.title}</h2>
        </div>
        <div className="text-right">
          <p className={`font-mono text-xl font-extrabold md:text-2xl ${isUrgent ? 'animate-pulse text-red' : ''}`}>
            {formatTime(timeLeft)}
          </p>
          <p className="text-[10px] tracking-widest text-muted uppercase">deadline</p>
        </div>
      </div>

      <p className="hidden px-4 pt-1 text-sm text-muted italic md:block">
        <span className="font-mono text-faint not-italic">// </span>
        {contract.quote}
      </p>

      <div className="flex flex-wrap gap-1.5 px-4 pt-2 pb-3 font-mono text-[11px]">
        <span className="rounded border border-line px-2 py-0.5 text-muted">{formatNumber(contract.code)} líneas</span>
        <span className="rounded border border-yellow/30 px-2 py-0.5 text-yellow">
          {formatMoney(contract.reward.money)}
        </span>
        <span className="rounded border border-purple/30 px-2 py-0.5 text-purple">
          +{formatNumber(contract.reward.xp)} XP
        </span>
        <span className="rounded border border-cyan/30 px-2 py-0.5 text-cyan">+{contract.reward.rep} ★</span>
      </div>

      {/* Barra fina: tiempo que queda. Barra verde: progreso del código */}
      <div className="h-0.5">
        <div className={`h-full ${isUrgent ? 'bg-red' : 'bg-blue'}`} style={{ width: `${timeRatio * 100}%` }} />
      </div>
      <div className="h-1 bg-panel-3">
        <div
          className="h-full bg-green shadow-[0_0_10px_var(--color-green)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  )
}

export default ContractCard
