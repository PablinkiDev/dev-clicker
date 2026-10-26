import { useState, type ReactNode } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import Avatar from '../components/Avatar'
import SeenOnLeave from '../components/SeenOnLeave'
import { titleName, type Profile } from '../data/personalization'
import { Stars } from '../components/EmployeeCard'
import NewBadge from '../components/NewBadge'
import { ROLES } from '../data/roles'
import { ROLE_STYLE } from '../ui'
import { OFFICES, officeCapacity } from '../data/offices'
import { STAGES } from '../data/stages'
import { formatMoney } from '../game/format'
import {
  dataLuck,
  employeeEffect,
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
  /** 🧑‍💻 Tu avatar y título (G4) */
  profile: Profile
  /** 🆕 Profesiones nuevas entre los candidatos (H4) */
  news: string[]
  onSeen: (keys: string[]) => void
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
  profile,
  news,
  onSeen,
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

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const selected = team.find((e) => e.uid === selectedUid) ?? null
  const freeSeats = Math.max(0, capacity - team.length)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <SeenOnLeave keys={news} onSeen={onSeen} />
      <ScreenHeader icon="👥" title={`Equipo · ${current.name}`}>
        Se paga <b className="text-text">una sola vez</b>, sin sueldos. Producen solo mientras haya un contrato activo.
      </ScreenHeader>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_360px]">
        {/* 🏢 La oficina como plano: un escritorio por puesto */}
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line-2 bg-panel-2 p-3 sm:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-extrabold">
              {current.icon} {current.name}{' '}
              <span className="font-mono text-xs font-normal text-muted">
                · {1 + team.length}/{seats} puestos
              </span>
            </p>
            <p className="font-mono text-xs">
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
            </p>
          </div>
          <p className="-mt-2 text-xs text-muted">{current.description}</p>

          {replacing && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl border border-yellow/45 bg-yellow/10 px-3 py-2 text-xs">
              <span>
                ↺ Tocá a quién reemplazar por <b>{replacing.name}</b> ({formatMoney(replacingPrice)}). Lo que pagaste
                por la otra persona <b>no se recupera</b>.
              </span>
              <button
                type="button"
                onClick={() => setReplacingUid(null)}
                className="ml-auto cursor-pointer rounded-md bg-panel-3 px-3 py-1 font-bold"
              >
                Cancelar
              </button>
            </div>
          )}

          <ul className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2.5 rounded-xl border border-line bg-panel p-3">
            <li>
              <Desk working={isWorking} name="Vos" sub={titleName(profile.title) ?? 'Fundador'} subClass="text-purple">
                <Avatar profile={profile} size={34} />
              </Desk>
            </li>
            {team.map((e) => {
              const style = ROLE_STYLE[e.role]
              const canReplace = replacing !== null && money >= replacingPrice
              return (
                <li key={e.uid}>
                  <Desk
                    working={isWorking}
                    name={e.name}
                    sub={`${ROLES[e.role].icon} ${'★'.repeat(e.stars)}`}
                    subClass={style.text}
                    selected={selectedUid === e.uid}
                    replace={replacing !== null}
                    disabled={replacing !== null && !canReplace}
                    onClick={() =>
                      replacing ? handleReplace(e) : setSelectedUid(selectedUid === e.uid ? null : e.uid)
                    }
                  >
                    <span
                      className={`grid size-8.5 place-items-center rounded-lg bg-linear-to-br font-mono text-[11px] font-extrabold text-white ${style.avatar}`}
                    >
                      {e.name.slice(0, 2).toUpperCase()}
                    </span>
                  </Desk>
                </li>
              )
            })}
            {Array.from({ length: freeSeats }, (_, i) => (
              <li
                key={`free-${i}`}
                className={`min-h-24 place-items-center rounded-xl border border-dashed border-line-2 text-center opacity-50 ${
                  i < 2 ? 'grid' : 'hidden sm:grid'
                }`}
              >
                <span>
                  <span className="block text-2xl">🪑</span>
                  <span className="font-mono text-[10px] text-muted">libre</span>
                </span>
              </li>
            ))}
            {/* En el celular, los puestos libres de más se juntan en uno */}
            {freeSeats > 2 && (
              <li className="grid min-h-24 place-items-center rounded-xl border border-dashed border-line-2 text-center opacity-50 sm:hidden">
                <span className="font-mono text-[11px] text-muted">+{freeSeats - 2} libres</span>
              </li>
            )}
          </ul>

          {/* Detalle de la persona elegida */}
          <div className="flex min-h-16 items-center gap-3 rounded-xl border border-line bg-panel p-3">
            {selected ? (
              <>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br font-mono text-xs font-extrabold text-white ${ROLE_STYLE[selected.role].avatar}`}
                >
                  {selected.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 text-xs">
                  <span className="block text-sm font-extrabold">
                    {selected.name} <Stars stars={selected.stars} />
                  </span>
                  <span className={`block ${ROLE_STYLE[selected.role].text}`}>
                    {ROLES[selected.role].icon} {ROLES[selected.role].name}
                  </span>
                  <span className="block font-mono">{employeeEffect(selected.role, selected.stars)}</span>
                  <span className="block text-muted italic">“{selected.quirk}”</span>
                </span>
              </>
            ) : (
              <span className="text-xs text-muted">
                {team.length
                  ? '👆 Tocá a alguien de tu equipo para ver qué aporta.'
                  : 'Todavía trabajás solo: contratá a alguien.'}
              </span>
            )}
          </div>

          {/* 🏢 Próxima oficina: en la columna grande, así no queda tapada abajo de los candidatos */}
          {next && (
            <div className="rounded-2xl border border-dashed border-line-2 bg-panel-2 p-3 sm:p-4">
              <p className="font-mono text-[10px] font-bold tracking-wider text-muted uppercase">Próxima oficina</p>
              <p className="font-extrabold">
                {next.icon} {next.name}{' '}
                <span className="font-mono text-xs font-normal text-muted">
                  · {officeCapacity(office + 1, homeOffice)} empleados
                </span>
              </p>
              <p className="text-xs text-muted">{next.description} El equipo se muda con vos.</p>
              {!nextLocked && (
                <>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
                    <span>
                      {formatMoney(Math.min(money, next.price))} / {formatMoney(next.price)}
                    </span>
                    <span>{Math.floor(Math.min(1, money / next.price) * 100)} %</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-3">
                    <i
                      className="block h-full bg-yellow"
                      style={{ width: `${Math.min(100, (money / next.price) * 100)}%` }}
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={onMove}
                disabled={nextLocked || money < next.price}
                className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
              >
                {nextLocked
                  ? `🔒 Requiere etapa ${STAGES[next.minStage].name}`
                  : `Mudarse · ${formatMoney(next.price)}`}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* 🧑‍💼 Candidatos */}
          <div className="rounded-2xl border border-line-2 bg-panel-2 p-3 sm:p-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">Candidatos</p>
              <button
                type="button"
                onClick={onReroll}
                disabled={money < rerollPrice}
                className="cursor-pointer rounded-md border border-line-2 bg-panel px-2.5 py-1 font-mono text-[11px] font-bold transition-colors hover:bg-panel-3 disabled:cursor-default disabled:text-faint"
              >
                🔄 Otros · {formatMoney(rerollPrice)}
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {candidates.map((c) => {
                const price = employeePrice(c.role, c.stars, stage)
                const isSelected = replacing?.uid === c.uid
                const style = ROLE_STYLE[c.role]
                return (
                  <li
                    key={c.uid}
                    title={`“${c.quirk}”`}
                    className={`flex items-center gap-2.5 rounded-xl border bg-panel p-2.5 ${isSelected ? 'border-yellow/60' : 'border-line'}`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg bg-linear-to-br font-mono text-[11px] font-extrabold text-white ${style.avatar}`}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="block font-extrabold">
                        {c.name} <Stars stars={c.stars} />
                      </span>
                      <span className={`block ${style.text}`}>
                        {ROLES[c.role].icon} {ROLES[c.role].name}
                        {news.includes(`role:${c.role}`) && <NewBadge className="ml-1.5" />}
                      </span>
                      <span className="block font-mono text-[11px] text-muted">{employeeEffect(c.role, c.stars)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHire(c)}
                      disabled={!isSelected && money < price}
                      className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-2 font-mono text-xs font-extrabold disabled:cursor-default disabled:border disabled:border-line-2 disabled:bg-panel-3 disabled:text-faint ${
                        isFull ? 'border border-yellow/50 bg-yellow/15 text-yellow' : 'bg-green text-[#062312]'
                      }`}
                    >
                      {isSelected ? '✕' : `${isFull ? '↺ ' : ''}${formatMoney(price)}`}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 font-mono text-[11px] text-faint">
              Hasta <b className="text-yellow">{'★'.repeat(maxStars(stage))}</b> como {STAGES[stage].name}
              {isFull && ' · oficina llena: contratar reemplaza a alguien'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

type DeskProps = {
  working: boolean
  name: string
  sub: string
  subClass: string
  children: ReactNode
  selected?: boolean
  /** Modo reemplazo: el escritorio se marca en amarillo */
  replace?: boolean
  disabled?: boolean
  onClick?: () => void
}

/** Un escritorio del plano: la pantalla se prende mientras hay un contrato */
function Desk({ working, name, sub, subClass, children, selected, replace, disabled, onClick }: DeskProps) {
  const body = (
    <>
      <i className={`mx-auto mb-1.5 block h-1.5 w-10 rounded-sm ${working ? 'animate-pulse bg-green' : 'bg-line-2'}`} />
      <span className="mx-auto grid w-fit place-items-center">{children}</span>
      <span className="mt-1 block truncate text-xs font-extrabold">{name}</span>
      <span className={`block truncate text-[10px] ${subClass}`}>{sub}</span>
    </>
  )
  const base = 'block min-h-24 w-full rounded-xl border bg-panel-2 px-1.5 py-2 text-center'
  if (!onClick) return <div className={`${base} border-purple/45`}>{body}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`${base} cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        replace
          ? 'border-yellow/60 hover:bg-yellow/10'
          : selected
            ? 'border-green ring-1 ring-green'
            : 'border-line-2 hover:border-text/40'
      }`}
    >
      {body}
    </button>
  )
}

export default TeamScreen
