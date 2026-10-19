import type { Contract } from '../game/types'

// Las props son los "parámetros" del componente: quien lo usa le pasa estos datos
type ContractCardProps = {
  contract: Contract
  code: number
  timeLeft: number
  isActive: boolean
}

/** 75 → "1:15" */
function formatTime(seconds: number): string {
  const s = Math.ceil(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function ContractCard({ contract, code, timeLeft, isActive }: ContractCardProps) {
  const progress = (code / contract.code) * 100
  const timeRatio = timeLeft / contract.time
  const isComplete = code >= contract.code
  const isUrgent = isActive && !isComplete && timeRatio < 0.3

  return (
    <article className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-panel-2">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">{contract.client} · cliente</p>
            <h2 className="text-lg font-extrabold tracking-tight">{contract.title}</h2>
          </div>
          <div className="text-right">
            <p className={`font-mono text-2xl font-extrabold ${isUrgent ? 'animate-pulse text-red' : ''}`}>
              {formatTime(isActive ? timeLeft : contract.time)}
            </p>
            <p className="text-[10px] tracking-widest text-muted uppercase">
              {isActive ? 'deadline' : 'plazo'}
            </p>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted italic">
          <span className="font-mono text-faint not-italic">// </span>
          {contract.quote}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
          <span className="rounded border border-line px-2 py-0.5 text-muted">{contract.code} líneas</span>
          <span className="rounded border border-yellow/30 px-2 py-0.5 text-yellow">
            ${contract.reward.money.toLocaleString('es-AR')}
          </span>
          <span className="rounded border border-purple/30 px-2 py-0.5 text-purple">
            +{contract.reward.xp} XP
          </span>
          <span className="rounded border border-cyan/30 px-2 py-0.5 text-cyan">
            +{contract.reward.rep} ★
          </span>
        </div>

        <p className="mt-4 flex justify-between font-mono text-sm">
          <span className="text-muted">{isComplete ? '✓ Build OK' : 'Progreso'}</span>
          <span className={isComplete ? 'text-green' : ''}>
            {code} / {contract.code} líneas
          </span>
        </p>
      </div>

      {/* Barra azul: tiempo que queda. Barra verde: progreso del código */}
      <div className="h-0.5">
        {isActive && (
          <div
            className={`h-full ${isUrgent ? 'bg-red' : 'bg-cyan'}`}
            style={{ width: `${timeRatio * 100}%` }}
          />
        )}
      </div>
      <div className="h-1.5 bg-panel">
        <div
          className="h-full bg-green transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  )
}

export default ContractCard
