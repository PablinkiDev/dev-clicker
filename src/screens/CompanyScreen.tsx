// ▲ Empresa (H5): un tablero a pantalla completa. Arriba, una franja con tu empresa, las etapas y las
// pestañas; abajo, tres columnas: dónde estás · qué sigue · tu carrera. En el celular se apilan.
import { useState, type ReactNode } from 'react'
import { STYLES, getCard, type CardPick } from '../data/cards'
import { getChallenge } from '../data/challenges'
import { IPO_SALES, type SaleRecord } from '../game/prestige'
import SellCard from '../components/SellCard'
import CompanyEditor from '../components/CompanyEditor'
import CompanyLogo from '../components/CompanyLogo'
import type { CompanyIdentity } from '../data/personalization'
import { STAGES } from '../data/stages'
import { formatDuration, formatMoney } from '../game/format'
import type { GameState, Stats } from '../game/reducer'
import { ACHIEVEMENTS } from '../data/achievements'
import { OFFICES, officeCapacity } from '../data/offices'
import { ROLES, ROLE_IDS } from '../data/roles'
import { achievementMultiplier } from '../game/records'
import { founderBonus } from '../game/prestige'
import { stageUnlocks } from '../game/unlocks'
import { formatNumber, formatRate } from '../game/format'
import type { Requirement } from '../game/stages'

type CompanyScreenProps = {
  /** Índice de la etapa actual */
  stage: number
  /** Requisitos de la próxima etapa; null si ya estás en la última */
  requirements: Requirement[] | null
  /** Multiplicador actual de los contratos (en modo infinito sigue creciendo) */
  scale: number
  /** Contratos entregados en modo infinito */
  endless: number
  /** Valor de la empresa: dinero ganado + equipo */
  value: number
  stats: Stats
  teamSize: number
  /** Tokens de inversión sin gastar */
  tokens: number
  history: SaleRecord[]
  onAscend: () => void
  onSell: () => void
  /** Contenido de la pestaña Logros */
  achievements: ReactNode
  /** 📊 Contenido de la pestaña Estadísticas (H3) */
  careerStats: ReactNode
  achievementsCount: string
  /** 🃏 Especializaciones elegidas en esta empresa */
  cards: CardPick[]
  /** 🏁 Desafío de esta empresa (o null) */
  challenge: string | null
  /** 🦄 Ventas hechas y si ya saliste a la bolsa */
  sales: number
  ipoDone: boolean
  onIpo: () => void
  /** 🏢 Nombre y logo (G4): se pueden cambiar cuando quieras */
  company: CompanyIdentity
  onRename: (company: CompanyIdentity) => void
  /** 📋 Para "Tu empresa hoy", los logros cerca y los bonus (H5) */
  game: GameState
  autoRate: number
  perClick: number
}

type Tab = 'stages' | 'achievements' | 'stats'

const CARD = 'rounded-2xl border border-line bg-panel-2 p-3.5'
const LABEL = 'mb-1.5 font-mono text-[10px] font-bold tracking-wider text-muted uppercase'
const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 })

/** La línea de las 5 etapas: hechas, la actual y las que faltan (en el celular, sin nombres) */
function Stepper({ stage }: { stage: number }) {
  return (
    <ol className="flex min-w-0 flex-1 items-start" aria-label={`Etapa ${stage + 1} de ${STAGES.length}`}>
      {STAGES.map((s, i) => {
        const state = i < stage ? 'done' : i === stage ? 'current' : 'locked'
        return (
          <li key={s.name} className={`flex items-start ${i ? 'min-w-0 flex-1' : ''}`}>
            {i > 0 && (
              <i className={`mx-1.5 mt-[15px] h-0.5 min-w-2 flex-1 rounded ${i <= stage ? 'bg-green' : 'bg-line-2'}`} />
            )}
            <span className={`flex shrink-0 flex-col items-center gap-1 ${state === 'locked' ? 'opacity-45' : ''}`}>
              <span
                title={s.name}
                className={`grid size-8 place-items-center rounded-full border-2 text-sm ${
                  state === 'current'
                    ? 'border-green bg-green/20 shadow-[0_0_0_4px_rgba(90,247,142,.15)]'
                    : state === 'done'
                      ? 'border-green bg-green/10 text-green'
                      : 'border-line-2 bg-panel-2'
                }`}
              >
                {state === 'done' ? '✓' : s.icon}
              </span>
              <span
                className={`hidden text-[10px] whitespace-nowrap md:block ${state === 'current' ? 'font-extrabold text-text' : 'text-muted'}`}
              >
                {s.name}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function CompanyScreen(props: CompanyScreenProps) {
  const { stage, requirements, company, sales } = props
  /** Lo que se está editando del nombre y el logo (null = no se está editando) */
  const [draft, setDraft] = useState<CompanyIdentity | null>(null)
  const [tab, setTab] = useState<Tab>('stages')

  const tabs: [Tab, string][] = [
    ['stages', '▲ Etapas'],
    ['achievements', `🏆 Logros ${props.achievementsCount}`],
    ['stats', '📊 Estadísticas'],
  ]

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pt-3 pb-6 md:px-4.5 lg:pb-3">
      {/* Franja de arriba: tu empresa · las etapas · las pestañas */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <CompanyLogo company={company} className="size-10 rounded-xl text-xl" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-extrabold">
              <span className="max-w-56 truncate">{company.name}</span>
              <button
                type="button"
                onClick={() => setDraft(draft ? null : company)}
                title="Cambiar nombre y logo"
                aria-label="Cambiar nombre y logo"
                className="cursor-pointer rounded-md px-1 text-sm opacity-70 hover:bg-panel-3 hover:opacity-100"
              >
                ✏️
              </button>
            </p>
            <p className="font-mono text-[11px] text-muted">
              empresa n.º {sales + 1}
              {props.tokens > 0 && (
                <>
                  {' · '}
                  <b className="text-purple">🪙 {props.tokens}</b>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="order-last w-full md:order-none md:w-auto md:flex-1">
          <Stepper stage={stage} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto" role="tablist">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                tab === id ? 'border-text bg-text text-bg' : 'border-line bg-panel-2 text-muted hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {draft && (
        <div className={`${CARD} max-w-xl animate-slide-down`}>
          <CompanyEditor value={draft} onChange={setDraft} />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                props.onRename(draft)
                setDraft(null)
              }}
              className="cursor-pointer rounded-lg bg-green px-4 py-2 text-sm font-extrabold text-[#062312]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="cursor-pointer rounded-lg border border-line-2 px-4 py-2 text-sm text-muted hover:text-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tab === 'achievements' && props.achievements}
      {tab === 'stats' && props.careerStats}
      {tab === 'stages' && (
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_1.25fr_1fr]">
          <div className="flex flex-col gap-3">
            <CurrentStage stage={stage} scale={props.scale} />
            <CompanyToday game={props.game} autoRate={props.autoRate} perClick={props.perClick} />
            <YourRun cards={props.cards} challenge={props.challenge} />
          </div>
          {/* En el celular, lo que tenés que hacer ahora va primero */}
          <div className="order-first flex flex-col gap-3 lg:order-none">
            {requirements ? (
              <>
                <NextStage stage={stage} requirements={requirements} onAscend={props.onAscend} />
                <WhatComes stage={stage + 1} />
              </>
            ) : (
              <SellCard
                value={props.value}
                stats={props.stats}
                teamSize={props.teamSize}
                companyName={company.name}
                scale={props.scale}
                endless={props.endless}
                onSell={props.onSell}
              />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Ipo sales={sales} ipoDone={props.ipoDone} onIpo={props.onIpo} />
            <RecentSales history={props.history} onAll={() => setTab('stats')} />
            <NearAchievements game={props.game} onAll={() => setTab('achievements')} />
            <Bonuses game={props.game} />
          </div>
        </div>
      )}
    </section>
  )
}

// --- Columna 1: dónde estás ----------------------------------------------------------

function CurrentStage({ stage, scale }: { stage: number; scale: number }) {
  const current = STAGES[stage]
  return (
    <div className={CARD}>
      <p className={LABEL}>
        Etapa actual · {stage + 1} de {STAGES.length}
      </p>
      <p className="text-base font-extrabold">
        {current.icon} {current.name}
      </p>
      <p className="mt-1 mb-2.5 text-xs text-muted">{current.description}</p>
      <span className="inline-flex rounded-full border border-line-2 bg-panel px-2.5 py-1 font-mono text-[11px]">
        Contratos&nbsp;<b className="text-yellow">×{fmt(scale)}</b>&nbsp;de código y paga
      </span>
    </div>
  )
}

/** 🏁 El desafío y 🃏 las cartas de esta empresa */
function YourRun({ cards, challenge }: { cards: CardPick[]; challenge: string | null }) {
  const active = getChallenge(challenge)
  return (
    <div className={CARD}>
      <p className={LABEL}>Tu run</p>
      {active && (
        <p className="mb-2.5 rounded-xl border border-orange/50 bg-orange/10 px-3 py-2 text-xs">
          🏁 <b>{active.name}</b> · {active.rule}.{' '}
          <span className="text-purple">Al vender: +{Math.round(active.tokenBonus * 100)} % tokens</span>
        </p>
      )}
      {cards.length === 0 ? (
        <p className="text-xs text-muted">
          Todavía no tenés especializaciones: elegís una carta cada vez que ascendés.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {cards.map((pick) => {
            const card = getCard(pick.id)
            if (!card) return null
            return (
              <li
                key={pick.id}
                title={`${card.name}: ${card.text(pick.rare)}`}
                className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 ${pick.rare ? 'border-yellow/60 bg-yellow/10' : 'border-line bg-panel'}`}
              >
                <span className="text-xl">{card.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold">
                    {card.name}
                    <span className={`ml-1.5 font-mono text-[10px] font-bold ${STYLES[card.style].color}`}>
                      {STYLES[card.style].icon}
                      {pick.rare && ' ✨'}
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-muted">{card.text(pick.rare)}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// --- Columna 2: qué sigue ----------------------------------------------------------------

function NextStage({
  stage,
  requirements,
  onAscend,
}: {
  stage: number
  requirements: Requirement[]
  onAscend: () => void
}) {
  const next = STAGES[stage + 1]
  const missing = requirements.filter((r) => !r.done).length
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 ${
        missing === 0 ? 'border-green/50 bg-linear-to-b from-green/10 to-panel-2' : 'border-line bg-panel-2'
      }`}
    >
      <p className={`${LABEL} mb-0`}>Próxima etapa</p>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{next.icon}</span>
        <div className="min-w-0">
          <p className="text-lg font-extrabold">{next.name}</p>
          <p className="text-xs text-muted">
            Desbloquea {next.unlocks.charAt(0).toLowerCase() + next.unlocks.slice(1)} · contratos ×
            {fmt(next.contractScale)}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {requirements.map((r) => (
          <li key={r.label}>
            <p className="mb-1 flex justify-between gap-3 font-mono text-xs">
              <span className={r.done ? 'text-green' : 'text-muted'}>
                {r.done ? '✓' : '○'} {r.label}
              </span>
              <b>{r.progress}</b>
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
        disabled={missing > 0}
        className="w-full cursor-pointer rounded-xl bg-green py-2.5 text-sm font-extrabold text-[#062312] disabled:cursor-default disabled:bg-panel-3 disabled:text-faint"
      >
        {missing === 0
          ? `▲ Ascender a ${next.name}`
          : `🔒 ${missing === 1 ? 'Falta 1 requisito' : `Faltan ${missing} requisitos`}`}
      </button>
    </div>
  )
}

// --- Columna 3: tu carrera ----------------------------------------------------------------

function Ipo({ sales, ipoDone, onIpo }: { sales: number; ipoDone: boolean; onIpo: () => void }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${ipoDone ? 'border-yellow/60 bg-yellow/10' : 'border-line bg-panel-2'}`}>
      <p className={LABEL}>🦄 Salida a la bolsa</p>
      {ipoDone ? (
        <>
          <p className="text-sm font-extrabold text-yellow">¡Sos una leyenda!</p>
          <button
            type="button"
            onClick={onIpo}
            className="mt-2 cursor-pointer rounded-lg border border-yellow/60 px-3 py-1.5 text-xs font-bold text-yellow hover:bg-yellow/10"
          >
            Ver mi carrera
          </button>
        </>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">
            El final del juego: vendé {IPO_SALES} empresas y sacá la tuya a la bolsa.
          </p>
          <p className="mb-1 flex justify-between font-mono text-xs">
            <span className="text-muted">Empresas vendidas</span>
            <b>
              {Math.min(sales, IPO_SALES)}/{IPO_SALES}
            </b>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
            <div className="h-full bg-purple" style={{ width: `${Math.min(1, sales / IPO_SALES) * 100}%` }} />
          </div>
          {sales >= IPO_SALES && (
            <button
              type="button"
              onClick={onIpo}
              className="mt-3 w-full cursor-pointer rounded-xl bg-yellow py-2.5 text-sm font-extrabold text-[#2b1a00]"
            >
              🦄 Salir a la bolsa
            </button>
          )}
        </>
      )}
    </div>
  )
}

/** Las últimas 3 ventas (todas, con detalle, en 📊 Estadísticas) */
function RecentSales({ history, onAll }: { history: SaleRecord[]; onAll: () => void }) {
  return (
    <div className={CARD}>
      <p className={`${LABEL} flex justify-between`}>
        Últimas ventas
        {history.length > 0 && (
          <button
            type="button"
            onClick={onAll}
            className="cursor-pointer font-normal tracking-normal normal-case hover:text-text"
          >
            ver todas en 📊
          </button>
        )}
      </p>
      {history.length === 0 ? (
        <p className="text-xs text-muted">
          Cuando llegues a Corporación vas a poder vender la empresa: empezás de cero, pero con tokens para mejoras que
          duran para siempre.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {history.slice(0, 3).map((sale, i) => (
            <li
              key={sale.soldAt}
              className="flex items-center gap-2 rounded-xl border border-line bg-panel px-2.5 py-2 font-mono text-xs"
            >
              {sale.company ? (
                <CompanyLogo company={sale.company} className="size-5 rounded text-[11px]" />
              ) : (
                <span className="w-5 text-center">💼</span>
              )}
              <span className="min-w-0 flex-1 truncate">
                {sale.company?.name ?? `Empresa n.º ${history.length - i}`}
              </span>
              <b className="text-yellow">{formatMoney(sale.value)}</b>
              <b className="text-purple">+{sale.tokens}</b>
              {sale.playTime !== undefined && (
                <span className="hidden text-faint sm:inline">{formatDuration(sale.playTime)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** 📋 Un vistazo a esta empresa: equipo, oficina, producción y lo hecho en esta run */
function CompanyToday({ game, autoRate, perClick }: { game: GameState; autoRate: number; perClick: number }) {
  const capacity = officeCapacity(game.office, game.skills.homeOffice)
  const roles = ROLE_IDS.map((id) => [id, game.team.filter((e) => e.role === id).length] as const).filter(
    ([, n]) => n > 0,
  )
  const facts: [string, string][] = [
    ['🏢 Oficina', `${OFFICES[game.office].name} · ${game.team.length}/${capacity}`],
    ['⚙️ Producción', `${formatRate(autoRate)} l/s · ${formatRate(perClick)} por clic`],
    ['📄 Contratos', `${game.stats.contractsDone} entregados · ${game.stats.contractsFailed} vencidos`],
    ['💰 Ganado', formatMoney(game.stats.moneyEarned)],
    ['⏱ Esta empresa', formatDuration(game.stats.playTime)],
  ]
  return (
    <div className={CARD}>
      <p className={LABEL}>Tu empresa hoy</p>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {roles.length === 0 ? (
          <span className="text-xs text-muted">Todavía trabajás solo. Contratá en Equipo.</span>
        ) : (
          roles.map(([id, n]) => (
            <span
              key={id}
              className="rounded-full border border-line-2 bg-panel px-2 py-0.5 font-mono text-[11px]"
              title={ROLES[id].name}
            >
              {ROLES[id].icon} {n} {ROLES[id].name}
            </span>
          ))
        )}
      </div>
      <dl className="flex flex-col gap-1 font-mono text-xs">
        {facts.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted">{label}</dt>
            <dd className="truncate text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** 🔓 Lo que aparece al llegar a la próxima etapa */
function WhatComes({ stage }: { stage: number }) {
  const unlocks = stageUnlocks(stage)
  if (unlocks.length === 0) return null
  return (
    <div className={CARD}>
      <p className={LABEL}>
        Qué trae {STAGES[stage].icon} {STAGES[stage].name}
      </p>
      <ul className="flex flex-col gap-1.5">
        {unlocks.map((u) => (
          <li key={u.text} className="flex gap-2.5 rounded-xl border border-line bg-panel px-2.5 py-2 text-xs">
            <span>{u.icon}</span>
            <span className="text-muted">{u.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 🏆 Los logros más cerca de completarse (los secretos no se muestran) */
function NearAchievements({ game, onAll }: { game: GameState; onAll: () => void }) {
  const unlocked = new Set(game.records.unlocked)
  const near = ACHIEVEMENTS.filter((a) => a.progress && !a.secret && !unlocked.has(a.id))
    .map((a) => {
      const [now, goal] = a.progress!(game)
      return { a, now, goal, ratio: now / goal }
    })
    .filter((x) => x.ratio > 0)
    .sort((x, y) => y.ratio - x.ratio)
    .slice(0, 3)
  if (near.length === 0) return null
  return (
    <div className={CARD}>
      <p className={`${LABEL} flex justify-between`}>
        Logros cerca
        <button
          type="button"
          onClick={onAll}
          className="cursor-pointer font-normal tracking-normal normal-case hover:text-text"
        >
          ver todos 🏆
        </button>
      </p>
      <ul className="flex flex-col gap-2.5">
        {near.map(({ a, now, goal, ratio }) => (
          <li key={a.id}>
            <p className="mb-1 flex justify-between gap-2 text-xs">
              <span className="truncate">
                {a.icon} <b>{a.name}</b> <span className="text-muted">· {a.description}</span>
              </span>
              <span className="shrink-0 font-mono text-muted">
                {formatNumber(now)}/{formatNumber(goal)}
              </span>
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full bg-yellow" style={{ width: `${ratio * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** ✨ Lo que ya ganaste para siempre */
function Bonuses({ game }: { game: GameState }) {
  const pct = (mult: number) => `+${Math.round((mult - 1) * 100)} %`
  const items: [string, string, string][] = [
    ['🏆', `Logros (${game.records.unlocked.length})`, pct(achievementMultiplier(game.records))],
    ['🏛', 'Experiencia de fundador', pct(founderBonus(game.prestige))],
    ['🏺', 'Artefactos', `${Object.keys(game.records.artifacts).length} en tu escritorio`],
  ]
  return (
    <div className={CARD}>
      <p className={LABEL}>Tus bonus permanentes</p>
      <dl className="flex flex-col gap-1 font-mono text-xs">
        {items.map(([icon, label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted">
              {icon} {label}
            </dt>
            <dd className="text-green">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default CompanyScreen
