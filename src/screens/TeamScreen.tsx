import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import EmployeeCard from '../components/EmployeeCard'
import { OFFICES, officeCapacity } from '../data/offices'
import { STAGES } from '../data/stages'
import { formatMoney } from '../game/format'
import {
  dataLuck,
  employeePrice,
  leadMultiplier,
  maxStars,
  pmMultiplier,
  qaMultiplier,
  uxMultiplier,
  type Employee,
} from '../game/team'

type TeamScreenProps = {
  team: Employee[]
  candidates: Employee[]
  /** Índice de la oficina actual */
  office: number
  /** Índice de la etapa: algunas oficinas piden una etapa mínima */
  stage: number
  money: number
  /** Producción automática total (líneas/seg) */
  autoRate: number
  /** Si hay un contrato en curso, el equipo está "trabajando" */
  isWorking: boolean
  /** replaceUid: a quién se reemplaza si la oficina está llena */
  onHire: (candidate: Employee, replaceUid?: string) => void
  onReroll: () => void
  /** Niveles de Home office (+puestos) y Code review obligatorio (+QA) */
  homeOffice: number
  codeReview: number
  /** Precio de la próxima búsqueda de candidatos */
  rerollPrice: number
  onMove: () => void
}

function TeamScreen({
  team,
  candidates,
  office,
  stage,
  money,
  autoRate,
  isWorking,
  onHire,
  onReroll,
  homeOffice,
  codeReview,
  rerollPrice,
  onMove,
}: TeamScreenProps) {
  const current = OFFICES[office]
  const next = OFFICES[office + 1]
  const capacity = officeCapacity(office, homeOffice)
  const isFull = team.length >= capacity
  const nextLocked = next !== undefined && stage < next.minStage
  const seats = 1 + capacity
  // Lo que aportan las profesiones que no escriben código (solo las que tenés)
  const percent = (mult: number) => Math.round((mult - 1) * 100)
  const perks = [
    { value: percent(qaMultiplier(team, codeReview)), text: 'XP', className: 'text-cyan' },
    { value: percent(uxMultiplier(team)), text: 'paga', className: 'text-purple' },
    { value: percent(pmMultiplier(team)), text: 'plazo', className: 'text-blue' },
    { value: Math.round(dataLuck(team) * 10), text: 'suerte', className: 'text-yellow' },
    { value: percent(leadMultiplier(team)), text: 'Tech Lead', className: 'text-red' },
  ].filter((p) => p.value > 0)

  // Estado solo de esta pantalla: el candidato elegido mientras se busca a quién reemplazar.
  // Si ese candidato ya no está en la lista (o hay lugar libre), no se está reemplazando a nadie.
  const [replacingUid, setReplacingUid] = useState<string | null>(null)
  const replacing = isFull ? (candidates.find((c) => c.uid === replacingUid) ?? null) : null
  const replacingPrice = replacing ? employeePrice(replacing.role, replacing.stars, stage) : 0

  function handleHire(candidate: Employee) {
    if (!isFull) onHire(candidate)
    else setReplacingUid(replacing?.uid === candidate.uid ? null : candidate.uid)
  }

  function handleReplace(leaving: Employee) {
    if (!replacing) return
    onHire(replacing, leaving.uid)
    setReplacingUid(null)
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="👥" title={`Equipo · ${current.name}`}>
        Se paga <b className="text-text">una sola vez</b>, sin sueldos. Producen solo mientras haya un contrato activo.
        <span className="mt-1 block font-mono text-xs">
          Producción:{' '}
          <b className="text-green">+{autoRate.toLocaleString('es-AR', { maximumFractionDigits: 1 })} l/s</b>
          {perks.map((p) => (
            <span key={p.text}>
              {' '}
              ·{' '}
              <b className={p.className}>
                +{p.value}% {p.text}
              </b>
            </span>
          ))}
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
              {officeCapacity(office + 1, homeOffice)} empleados · {next.description} El equipo se muda con vos.
            </p>
            <button
              type="button"
              onClick={onMove}
              disabled={nextLocked || money < next.price}
              className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
            >
              {nextLocked ? `🔒 Requiere etapa ${STAGES[next.minStage].name}` : `Mudarse · ${formatMoney(next.price)}`}
            </button>
          </div>
        )}
      </div>

      {replacing && (
        <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl border border-yellow/45 bg-yellow/10 px-3.5 py-2.5 text-[13px]">
          <span>
            ↺ Elegí a quién reemplazar por <b>{replacing.name}</b> ({formatMoney(replacingPrice)}). Lo que pagaste por
            la otra persona <b>no se recupera</b>.
          </span>
          <button
            type="button"
            onClick={() => setReplacingUid(null)}
            className="ml-auto cursor-pointer rounded-md bg-panel-3 px-3 py-1 text-xs font-bold"
          >
            Cancelar
          </button>
        </div>
      )}

      <p className="mb-2.5 font-mono text-xs text-muted">en tu equipo/</p>
      <ul className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        <li className="rounded-xl border border-purple/45 bg-panel-2 p-3.5">
          <p className="font-extrabold">Vos</p>
          <p className="text-xs text-muted">Fundador · programa a mano</p>
          <p className="mt-2 text-xs text-muted italic">“Café ilimitado, sueño limitado.”</p>
        </li>
        {team.map((e) => (
          <EmployeeCard key={e.uid} employee={e}>
            {replacing ? (
              <button
                type="button"
                onClick={() => handleReplace(e)}
                disabled={money < replacingPrice}
                className="w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
              >
                ↺ Reemplazar a {e.name}
              </button>
            ) : (
              <p className="flex items-center gap-2 border-t border-dashed border-line pt-2 font-mono text-[11px] text-muted">
                <i className={`size-2 rounded-full ${isWorking ? 'animate-pulse bg-green' : 'bg-faint'}`} />
                {isWorking ? 'trabajando' : 'esperando un contrato'}
              </p>
            )}
          </EmployeeCard>
        ))}
      </ul>

      <div className="mb-2.5 flex items-center gap-3">
        <p className="font-mono text-xs text-muted">candidatos/</p>
        <button
          type="button"
          onClick={onReroll}
          disabled={money < rerollPrice}
          className="cursor-pointer rounded-md border border-line-2 bg-panel-2 px-2.5 py-1 font-mono text-[11px] font-bold transition-colors hover:bg-panel-3 disabled:cursor-default disabled:text-faint"
        >
          🔄 Buscar otros · {formatMoney(rerollPrice)}
        </button>
        <span className="ml-auto font-mono text-[11px] text-muted">
          hasta <b className="text-yellow">{'★'.repeat(maxStars(stage))}</b> como {STAGES[stage].name}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {candidates.map((c) => {
          const price = employeePrice(c.role, c.stars, stage)
          const isSelected = replacing?.uid === c.uid
          let label = `Contratar · ${formatMoney(price)}`
          if (isSelected) label = '✕ Cancelar reemplazo'
          else if (isFull) label = `↺ Contratar reemplazando · ${formatMoney(price)}`
          return (
            <EmployeeCard key={c.uid} employee={c}>
              <button
                type="button"
                onClick={() => handleHire(c)}
                disabled={!isSelected && money < price}
                className={`w-full cursor-pointer rounded-lg py-2 text-sm font-extrabold disabled:cursor-default disabled:border disabled:border-line-2 disabled:bg-panel-3 disabled:text-faint ${
                  isFull ? 'border border-yellow/50 bg-yellow/15 text-yellow' : 'bg-green text-[#062312]'
                }`}
              >
                {label}
              </button>
            </EmployeeCard>
          )
        })}
      </ul>
    </section>
  )
}

export default TeamScreen
