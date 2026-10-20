import ScreenHeader from '../components/ScreenHeader'
import EmployeeCard from '../components/EmployeeCard'
import { OFFICES } from '../data/offices'
import { formatMoney } from '../game/format'
import { employeePrice, qaMultiplier, type Employee } from '../game/team'

type TeamScreenProps = {
  team: Employee[]
  candidates: Employee[]
  /** Índice de la oficina actual */
  office: number
  money: number
  /** Producción automática total (líneas/seg) */
  autoRate: number
  /** Si hay un contrato en curso, el equipo está "trabajando" */
  isWorking: boolean
  onHire: (candidate: Employee) => void
  onMove: () => void
}

function TeamScreen({ team, candidates, office, money, autoRate, isWorking, onHire, onMove }: TeamScreenProps) {
  const current = OFFICES[office]
  const next = OFFICES[office + 1]
  const isFull = team.length >= current.capacity
  const seats = 1 + current.capacity
  const qaPercent = Math.round((qaMultiplier(team) - 1) * 100)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="👥" title={`Equipo · ${current.name}`}>
        Se paga <b className="text-text">una sola vez</b>, sin sueldos. Producen solo mientras haya un contrato activo.
        <span className="mt-1 block font-mono text-xs">
          Producción: <b className="text-green">+{autoRate.toLocaleString('es-AR', { maximumFractionDigits: 1 })} l/s</b>
          {qaPercent > 0 && (
            <>
              {' '}
              · <b className="text-cyan">+{qaPercent}% XP</b>
            </>
          )}
        </span>
      </ScreenHeader>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-60 flex-1 rounded-xl border border-line bg-panel-2 p-3.5">
          <p className="font-extrabold">
            {current.icon} {current.name}
          </p>
          <p className="text-xs text-muted">{current.description}</p>
          <div className="mt-2.5 mb-1.5 flex flex-wrap gap-1.5">
            {Array.from({ length: seats }, (_, i) => (
              <span
                key={i}
                className={`grid size-8.5 place-items-center rounded-lg text-base ${
                  i <= team.length ? 'bg-green/15 ring-1 ring-green/45' : 'bg-panel-3 opacity-45'
                }`}
              >
                {i === 0 ? '🧑‍💻' : i <= team.length ? '👤' : '🪑'}
              </span>
            ))}
          </div>
          <p className="font-mono text-xs text-muted">
            {1 + team.length}/{seats} puestos ocupados
          </p>
        </div>

        {next && (
          <div className="min-w-60 flex-1 rounded-xl border border-dashed border-line-2 bg-panel-2 p-3.5">
            <p className="font-mono text-[10px] font-bold tracking-wider text-muted uppercase">Próxima oficina</p>
            <p className="font-extrabold">
              {next.icon} {next.name}
            </p>
            <p className="text-xs text-muted">
              {next.capacity} empleados · {next.description} El equipo se muda con vos.
            </p>
            <button
              type="button"
              onClick={onMove}
              disabled={money < next.price}
              className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
            >
              Mudarse · {formatMoney(next.price)}
            </button>
          </div>
        )}
      </div>

      <p className="mb-2.5 font-mono text-xs text-muted">en tu equipo/</p>
      <ul className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        <li className="rounded-xl border border-purple/45 bg-panel-2 p-3.5">
          <p className="font-extrabold">Vos</p>
          <p className="text-xs text-muted">Fundador · programa a mano</p>
          <p className="mt-2 text-xs text-muted italic">“Café ilimitado, sueño limitado.”</p>
        </li>
        {team.map((e) => (
          <EmployeeCard key={e.uid} employee={e}>
            <p className="flex items-center gap-2 border-t border-dashed border-line pt-2 font-mono text-[11px] text-muted">
              <i className={`size-2 rounded-full ${isWorking ? 'animate-pulse bg-green' : 'bg-faint'}`} />
              {isWorking ? 'trabajando' : 'esperando un contrato'}
            </p>
          </EmployeeCard>
        ))}
      </ul>

      <p className="mb-2.5 font-mono text-xs text-muted">candidatos/</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {candidates.map((c) => {
          const price = employeePrice(c.role, c.stars)
          return (
            <EmployeeCard key={c.uid} employee={c}>
              <button
                type="button"
                onClick={() => onHire(c)}
                disabled={isFull || money < price}
                className="w-full cursor-pointer rounded-lg bg-green py-2 text-sm font-extrabold text-[#062312] disabled:cursor-default disabled:border disabled:border-line-2 disabled:bg-panel-3 disabled:text-faint"
              >
                {isFull ? '🪑 No entra nadie más' : `Contratar · ${formatMoney(price)}`}
              </button>
            </EmployeeCard>
          )
        })}
      </ul>
    </section>
  )
}

export default TeamScreen
