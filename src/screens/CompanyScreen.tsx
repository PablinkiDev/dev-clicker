import ScreenHeader from '../components/ScreenHeader'
import { STAGES } from '../data/stages'
import type { Requirement } from '../game/stages'

type CompanyScreenProps = {
  /** Índice de la etapa actual */
  stage: number
  /** Requisitos de la próxima etapa; null si ya estás en la última */
  requirements: Requirement[] | null
  onAscend: () => void
}

function CompanyScreen({ stage, requirements, onAscend }: CompanyScreenProps) {
  const current = STAGES[stage]
  const next = STAGES[stage + 1]
  const ready = requirements !== null && requirements.every((r) => r.done)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="▲" title={`Empresa · ${current.name}`}>
        Se asciende <b className="text-text">a mano</b> al cumplir los requisitos. Cada etapa desbloquea contratos y
        mejoras nuevas.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">etapas/</p>
      <ol className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {STAGES.map((s, i) => {
          const state = i < stage ? 'done' : i === stage ? 'current' : 'locked'
          return (
            <li
              key={s.name}
              className={`rounded-xl border p-3 ${
                state === 'current'
                  ? 'border-green/50 bg-green/10'
                  : state === 'done'
                    ? 'border-line bg-panel-2'
                    : 'border-dashed border-line bg-panel opacity-60'
              }`}
            >
              <p className="font-mono text-[10px] font-bold tracking-wider text-muted uppercase">
                Etapa {i + 1} {state === 'done' && '✓'}
              </p>
              <p className="font-extrabold">
                {s.icon} {s.name}
              </p>
            </li>
          )
        })}
      </ol>

      <div className="mb-5 max-w-xl rounded-xl border border-line bg-panel-2 p-3.5">
        <p className="font-extrabold">
          {current.icon} {current.name}
        </p>
        <p className="text-xs text-muted">{current.description}</p>
      </div>

      {next && requirements ? (
        <div className="max-w-xl rounded-xl border border-dashed border-line-2 bg-panel-2 p-3.5">
          <p className="font-mono text-[10px] font-bold tracking-wider text-muted uppercase">Próxima etapa</p>
          <p className="font-extrabold">
            {next.icon} {next.name}
          </p>
          <p className="mb-3 text-xs text-muted">Desbloquea: {next.unlocks}</p>

          <ul className="mb-3 flex flex-col gap-2.5">
            {requirements.map((r) => (
              <li key={r.label}>
                <p className="mb-1 flex justify-between font-mono text-xs">
                  <span className={r.done ? 'text-green' : 'text-muted'}>
                    {r.done ? '✓' : '○'} {r.label}
                  </span>
                  <span>{r.progress}</span>
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
                  <div
                    className={`h-full transition-[width] duration-500 ${r.done ? 'bg-green' : 'bg-yellow'}`}
                    style={{ width: `${r.ratio * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onAscend}
            disabled={!ready}
            className="w-full cursor-pointer rounded-lg bg-green py-2 text-sm font-extrabold text-[#062312] disabled:cursor-default disabled:border disabled:border-line-2 disabled:bg-panel-3 disabled:text-faint"
          >
            {ready ? `▲ Ascender a ${next.name}` : '🔒 Faltan requisitos'}
          </button>
        </div>
      ) : (
        <p className="max-w-xl rounded-xl border border-yellow/40 bg-yellow/10 p-3.5 text-sm">
          🏆 Llegaste a la cima. El modo infinito y la venta de la empresa llegan pronto.
        </p>
      )}
    </section>
  )
}

export default CompanyScreen
