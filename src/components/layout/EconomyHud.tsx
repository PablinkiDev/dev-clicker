import Sponsor from '../Sponsor'
import type { ReactNode } from 'react'
import { formatMoney, formatNumber, formatRate } from '../../game/format'
import type { Goal, Purchase } from '../../game/goals'
import { REP_LEVELS, nextRepThreshold, repLevel } from '../../game/reputation'
import type { View } from '../../ui'
import { HelpButton } from '../HelpModal'
import GainPop from '../GainPop'
import { InboxButton } from '../InboxPanel'
import TutorialBubble from '../TutorialBubble'

type EconomyHudProps = {
  money: number
  xp: number
  rep: number
  perClick: number
  auto: number
  critPercent: number
  /** Ganancia por minuto (promedio de los últimos minutos); null mientras no hay datos */
  moneyPerMinute: number | null
  xpPerMinute: number | null
  /** Total ganado en la partida, para el detalle del dinero */
  moneyEarned: number
  nextPurchase: Purchase | null
  /** Mejoras que se pueden comprar ahora con XP */
  upgradesAvailable: number
  /** Concentración: null si no se aprendió */
  focus: { active: boolean; mult: number; seconds: number } | null
  /** Modificadores activos (bug dorado, eventos) con los segundos que les quedan */
  modifiers: { id: string; icon: string; target: 'auto' | 'click'; mult: number; seconds: number }[]
  goal: Goal
  onNavigate: (view: View) => void
  onHelp: () => void
  /** 🔔 Notificaciones sin ver y abrir el centro (H2) */
  unread: number
  onInbox: () => void
  /** 🧭 Tutorial (C2): señalar la XP para la primera mejora */
  showUpgradeTutorial?: boolean
}

/** Un bloque de la barra: se puede tocar para ir a su pantalla */
function Cell({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-w-0 cursor-pointer border-line px-2 py-1.5 text-left transition-colors hover:bg-panel-2 md:border-r md:px-4 md:py-2 ${className}`}
    >
      {children}
    </button>
  )
}

function Label({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <span className="flex items-baseline gap-2 whitespace-nowrap">
      <span className="truncate text-[9px] font-bold tracking-wider text-faint uppercase md:text-[10px]">
        {children}
      </span>
      {/* En el celular no entra: se ve en la compu */}
      <span className="hidden md:inline">{aside}</span>
    </span>
  )
}

/** "▲ +$182 K/min" (o nada si todavía no hay datos o no se ganó nada) */
function Trend({ value, format }: { value: number | null; format: (n: number) => string }) {
  if (value === null || value <= 0) return null
  return <span className="hidden font-mono text-[11px] font-semibold text-green sm:inline">▲ +{format(value)}/min</span>
}

const Sub = ({ children }: { children: ReactNode }) => (
  <span className="mt-0.5 hidden truncate font-mono text-[11px] text-muted md:block">{children}</span>
)

const Bar = ({ ratio, className }: { ratio: number; className: string }) => (
  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-panel-3">
    <span
      className={`block h-full transition-[width] duration-500 ${className}`}
      style={{ width: `${ratio * 100}%` }}
    />
  </span>
)

/**
 * Barra de economía compacta: cada número con su tendencia y un "próximo paso",
 * y a la derecha el objetivo del momento. Cada bloque lleva a su pantalla.
 */
function EconomyHud(props: EconomyHudProps) {
  const { money, xp, rep, perClick, auto, critPercent, nextPurchase, goal, onNavigate } = props
  const level = repLevel(rep)
  const nextRep = nextRepThreshold(rep)
  const repRatio = nextRep === null ? 1 : (rep - REP_LEVELS[level]) / (nextRep - REP_LEVELS[level])
  const focus = props.focus

  return (
    <section className="relative grid shrink-0 border-b border-line bg-panel pt-[env(safe-area-inset-top)] grid-cols-4 md:grid-cols-[repeat(4,minmax(0,1fr))_1.35fr]">
      <Cell onClick={() => onNavigate('team')}>
        <Label aside={<Trend value={props.moneyPerMinute} format={formatMoney} />}>Dinero</Label>
        <span className="block font-mono text-base font-extrabold tracking-tight md:text-lg text-yellow md:text-xl">
          <GainPop value={money} format={formatMoney}>
            {formatMoney(money)}
          </GainPop>
        </span>
        <Sub>
          {nextPurchase ? (
            <>
              próx.: <span className="text-text">{nextPurchase.name}</span>{' '}
              {money >= nextPurchase.price ? (
                <span className="text-green">✓</span>
              ) : (
                <span>· faltan {formatMoney(nextPurchase.price - money)}</span>
              )}
            </>
          ) : (
            'todo comprado 🎉'
          )}
        </Sub>
        {/* Detalle al pasar el mouse */}
        <span className="pointer-events-none absolute top-full left-3 z-20 mt-1 hidden w-80 rounded-xl border border-line-2 bg-panel-3 p-3 font-mono text-xs shadow-xl group-hover:block">
          <span className="flex justify-between gap-3">
            <span className="text-muted">Exacto</span>${Math.round(money).toLocaleString('es-AR')}
          </span>
          <span className="mt-1 flex justify-between gap-3">
            <span className="text-muted">Ganado en la partida</span>
            {formatMoney(props.moneyEarned)}
          </span>
          {props.moneyPerMinute !== null && (
            <span className="mt-1 flex justify-between gap-3">
              <span className="text-muted">Por minuto (últ. 5 min)</span>
              <span className="text-green">+{formatMoney(props.moneyPerMinute)}</span>
            </span>
          )}
        </span>
      </Cell>

      <Cell onClick={() => onNavigate('skills')}>
        <Label aside={<Trend value={props.xpPerMinute} format={formatNumber} />}>Experiencia</Label>
        <span className="flex items-center gap-1.5 font-mono text-base font-extrabold tracking-tight md:text-lg text-purple md:text-xl">
          <GainPop value={xp} format={(n) => `${formatNumber(n)} XP`}>
            {formatNumber(xp)}
          </GainPop>
          {props.upgradesAvailable > 0 && (
            <span className="rounded-md bg-purple px-1.5 text-[10px] text-[#1b0f2b]">{props.upgradesAvailable}</span>
          )}
        </span>
        <Sub>
          {props.upgradesAvailable > 0
            ? `${props.upgradesAvailable} ${props.upgradesAvailable === 1 ? 'mejora disponible' : 'mejoras disponibles'} →`
            : 'juntando para la próxima mejora'}
        </Sub>
        {props.showUpgradeTutorial && (
          <TutorialBubble
            text="👆 Tenés XP para tu primera mejora: tocá acá"
            pointing="up"
            className="top-full left-3 mt-2"
          />
        )}
      </Cell>

      <Cell onClick={() => onNavigate('board')}>
        <Label
          aside={
            <span className="rounded-full border border-line-2 px-1.5 font-mono text-[10px] font-bold text-muted">
              Ofertas Nv.{level + 1}
            </span>
          }
        >
          Reputación
        </Label>
        <span className="block font-mono text-base font-extrabold tracking-tight md:text-lg text-cyan md:text-xl">
          {formatNumber(rep)} ★
        </span>
        <Bar ratio={repRatio} className="bg-cyan" />
        <Sub>{nextRep === null ? 'nivel máximo' : `${formatNumber(nextRep)} ★ para Nv.${level + 2}`}</Sub>
      </Cell>

      <Cell onClick={() => onNavigate('team')}>
        <Label aside={<span className="font-mono text-[11px] text-muted">{critPercent}% crit</span>}>Producción</Label>
        <span
          className={`block font-mono text-base font-extrabold tracking-tight md:text-xl ${props.modifiers.some((m) => m.target === 'auto' && m.mult > 1) ? 'text-yellow' : 'text-green'}`}
        >
          {formatRate(auto)} <small className="text-xs text-muted">l/s</small>
        </span>
        <Sub>
          {formatRate(perClick)} por clic
          {props.modifiers.map((m) => (
            <span key={m.id} className={m.mult >= 1 ? 'text-yellow' : 'text-red'}>
              {' · '}
              {m.icon} {m.target === 'click' ? 'clic ' : ''}×{formatRate(m.mult)} {m.seconds}s
            </span>
          ))}
          {focus && (
            <>
              {' · 🎯 '}
              {focus.active ? (
                <span className="text-purple">
                  ×{focus.mult} {focus.seconds}s
                </span>
              ) : focus.seconds > 0 ? (
                `${focus.seconds}s`
              ) : (
                <span className="text-purple">lista</span>
              )}
            </>
          )}
        </Sub>
      </Cell>

      <Cell
        onClick={() => onNavigate('company')}
        className={`col-span-4 border-t pr-25 md:col-span-1 md:border-t-0 md:border-r-0 md:pr-4 ${
          goal.ready ? 'bg-linear-to-r from-green/10 to-transparent' : 'bg-linear-to-r from-yellow/6 to-transparent'
        }`}
      >
        <Label>Objetivo</Label>
        <span className={`block truncate text-sm font-extrabold ${goal.ready ? 'text-green' : ''}`}>{goal.title}</span>
        <span title={goal.detail}>
          <Sub>{goal.detail}</Sub>
        </span>
        <Bar ratio={goal.progress} className={goal.ready ? 'bg-green' : 'bg-yellow'} />
      </Cell>
      {/* 🤝 En el celular no hay barra de título: el logo va junto a la campanita */}
      <Sponsor variant="icon" className="absolute right-16 bottom-2.5 z-10 md:hidden" />
      <InboxButton unread={props.unread} onClick={props.onInbox} />
      <HelpButton onClick={props.onHelp} />
    </section>
  )
}

export default EconomyHud
