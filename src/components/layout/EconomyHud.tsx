import type { ReactNode } from 'react'
import { formatMoney, formatRate } from '../../game/format'
import { nextRepThreshold, repLevel } from '../../game/reputation'

type EconomyHudProps = {
  money: number
  xp: number
  rep: number
  perClick: number
  auto: number
  critPercent: number
}

type StatProps = {
  label: string
  icon: string
  value: string
  color: string
  children?: ReactNode
}

function Stat({ label, icon, value, color, children }: StatProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 rounded-xl border border-line bg-panel-2 px-1 py-2 text-center md:flex-row md:items-start md:gap-3 md:px-3.5 md:py-3 md:text-left">
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-extrabold md:size-8.5 md:text-sm ${color} bg-current/15`}
      >
        <span className="text-current">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold tracking-wider text-muted uppercase md:text-[10px]">{label}</p>
        <p className={`font-mono text-[15px] font-extrabold tracking-tight md:text-2xl ${color}`}>{value}</p>
        {children}
      </div>
    </div>
  )
}

/** Panel de economía: siempre visible arriba del editor */
function EconomyHud({ money, xp, rep, perClick, auto, critPercent }: EconomyHudProps) {
  return (
    <section className="grid shrink-0 grid-cols-4 gap-1.5 border-b border-line bg-panel px-2.5 pt-[calc(8px+env(safe-area-inset-top))] pb-2 md:gap-2.5 md:px-4.5 md:py-3">
      <Stat label="Dinero" icon="$" value={formatMoney(money)} color="text-yellow" />
      <Stat label="Experiencia" icon="XP" value={xp.toLocaleString('es-AR')} color="text-purple" />
      <Stat label="Reputación" icon="★" value={rep.toLocaleString('es-AR')} color="text-cyan">
        <p className="hidden font-mono text-[11px] text-muted md:block">
          Ofertas Nv.{repLevel(rep) + 1}
          {nextRepThreshold(rep) !== null ? ` · ${nextRepThreshold(rep)} ★ para Nv.${repLevel(rep) + 2}` : ' · máximo'}
        </p>
      </Stat>
      <Stat label="Producción" icon="{}" value={`${formatRate(perClick)}/clic`} color="text-green">
        <p className="hidden font-mono text-[11px] text-muted md:block">
          +{formatRate(auto)} l/s · {critPercent}% crit
        </p>
      </Stat>
    </section>
  )
}

export default EconomyHud
