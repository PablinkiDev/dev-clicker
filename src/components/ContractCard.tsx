import type { Contract } from '../game/types'

// Las props son los "parámetros" del componente: quien lo usa le pasa estos datos
type ContractCardProps = {
  contract: Contract
  code: number
}

function ContractCard({ contract, code }: ContractCardProps) {
  const progress = (code / contract.code) * 100
  const isComplete = code >= contract.code

  return (
    <article className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-panel-2">
      <div className="p-4">
        <p className="text-xs text-muted">{contract.client} · cliente</p>
        <h2 className="text-lg font-extrabold tracking-tight">{contract.title}</h2>
        <p className="mt-2 text-sm text-muted italic">
          <span className="font-mono text-faint not-italic">// </span>
          {contract.quote}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
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
