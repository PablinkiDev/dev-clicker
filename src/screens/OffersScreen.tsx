// 📋 Tablón de ofertas (H5): tarjetas grandes con todo lo que hace falta para elegir, y un panel con tu
// ritmo, la reputación y la Captación automática. Solo usa los colores del tema: anda en todos los editores.
import TutorialBubble from '../components/TutorialBubble'
import { LANG_ICON, TECH_ICON } from '../ui'
import { SPECIAL_RULES } from '../game/offers'
import { TECHS, payTier, specialtyBonus, type TechLevels } from '../data/techs'
import { getBoss } from '../data/bosses'
import { clientIcon } from '../data/clients'
import { estimateSeconds } from '../game/formulas'
import { fileName, formatMoney, formatNumber, formatRate } from '../game/format'
import { REP_LEVELS, boardSize, nextRepThreshold, repLevel } from '../game/reputation'
import type { Contract, Difficulty } from '../game/types'

type OffersScreenProps = {
  offers: Contract[]
  perClick: number
  /** Líneas por segundo del equipo */
  autoRate: number
  /** Contrato en curso: si hay uno, no se puede aceptar otro */
  activeFile: string | null
  /** Si todavía no sabe JavaScript, mostramos una pista de que hay más contratos */
  knowsJs: boolean
  /** Niveles de tecnología: para la especialización de cada oferta */
  tech: TechLevels
  /** ★ Reputación: decide cuántas ofertas hay y qué tan grandes son */
  rep: number
  /** Interruptor de la Captación automática; null si la mejora no está comprada */
  autoAccept: boolean | null
  onAutoAcceptChange: (on: boolean) => void
  onAccept: (offer: Contract) => void
  /** 🧭 Tutorial: señalar la primera oferta (C2) */
  showTutorial?: boolean
}

const DIFFICULTY: Record<Difficulty, { text: string; badge: string; band: string }> = {
  easy: { text: 'Fácil', badge: 'bg-green/15 text-green', band: 'bg-green' },
  mid: { text: 'Media', badge: 'bg-yellow/15 text-yellow', band: 'bg-yellow' },
  hard: { text: 'Difícil', badge: 'bg-red/15 text-red', band: 'bg-red' },
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'mid', 'hard']

const PANEL = 'rounded-2xl border border-line bg-panel-2 p-3.5'
const LABEL = 'mb-2 font-mono text-[10px] font-bold tracking-wider text-muted uppercase'

function OffersScreen(props: OffersScreenProps) {
  const { offers, activeFile, showTutorial = false } = props
  // Ordenamos una copia: nunca hay que modificar (mutar) las props ni el estado
  const sorted = [...offers].sort(
    // Jefes y especiales primero; después de fácil a difícil
    (a, b) =>
      Number(!!b.boss) - Number(!!a.boss) ||
      Number(!!b.special) - Number(!!a.special) ||
      DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
  )
  // 🧭 Tutorial: el contrato guiado (o el más tranquilo)
  const tutorialTarget =
    sorted.find((o) => o.once) ?? sorted.find((o) => o.difficulty === 'easy' && !o.special && !o.boss) ?? sorted[0]

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-6 md:px-4.5">
      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <p className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-base font-extrabold">
              {activeFile ? (
                <>
                  ⏳ Trabajando en <span className="font-mono">{activeFile}</span>
                </>
              ) : (
                '📋 Elegí tu próximo contrato'
              )}
            </span>
            <span className="font-mono text-xs text-muted">
              {activeFile
                ? 'Terminalo antes de aceptar otro'
                : 'El reloj no corre hasta que aceptes · siempre hay una fácil, una media y una difícil'}
            </span>
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))]">
            {sorted.map((offer) => (
              <li key={offer.uid} className="relative">
                {showTutorial && offer.uid === tutorialTarget?.uid && (
                  <TutorialBubble
                    text="👇 Empezá por acá: tocá Aceptar"
                    className="-top-11 left-1/2 -translate-x-1/2"
                  />
                )}
                <OfferCard {...props} offer={offer} />
              </li>
            ))}
          </ul>
        </div>
        <SidePanel {...props} />
      </div>
    </section>
  )
}

function OfferCard({ offer, perClick, autoRate, tech, activeFile, onAccept }: OffersScreenProps & { offer: Contract }) {
  const difficulty = DIFFICULTY[offer.difficulty]
  const boss = offer.boss ? getBoss(offer.boss) : undefined
  const special = offer.special ? SPECIAL_RULES[offer.special] : undefined
  // La especialización acelera los contratos de tu tecnología (D3); "Solo a mano": el equipo no ayuda
  const speed = specialtyBonus(tech, offer.lang)
  const tier = payTier(offer.lang, offer.stack)
  const team = offer.special === 'clicksOnly' ? 0 : autoRate
  const estimate = estimateSeconds(offer.code, perClick * speed, team * speed)
  const ratio = estimate / offer.time
  const verdict =
    ratio < 0.7
      ? { text: 'Cómodo', color: 'text-green', bar: 'bg-green' }
      : ratio < 1
        ? { text: 'Ajustado', color: 'text-yellow', bar: 'bg-yellow' }
        : { text: 'Arriesgado', color: 'text-red', bar: 'bg-red' }
  const lang = LANG_ICON[offer.lang ?? 'html']

  return (
    <article
      className={`relative flex h-full flex-col gap-2.5 overflow-hidden rounded-2xl border p-3.5 pt-4 transition-transform hover:-translate-y-0.5 ${
        boss
          ? 'border-red/70 bg-linear-to-b from-red/12 to-panel-2'
          : special
            ? 'border-yellow/65 bg-linear-to-b from-yellow/10 to-panel-2'
            : 'border-line bg-panel-2 hover:border-line-2'
      }`}
    >
      {/* Banda de color: dificultad (o jefe / especial) */}
      <i className={`absolute inset-x-0 top-0 h-[3px] ${boss ? 'bg-red' : special ? 'bg-yellow' : difficulty.band}`} />
      {boss && (
        <p className="font-mono text-[11px] font-bold text-red">
          👹 CLIENTE JEFE · paga ×10 + 📦 caja{' '}
          <span className="font-normal text-muted">· si se vence, no pasa nada</span>
        </p>
      )}
      {special && (
        <p className="font-mono text-[11px] font-bold text-yellow" title={special.detail}>
          ⭐ {special.name} <span className="font-normal text-muted">· {special.detail}</span>
        </p>
      )}

      <div className="flex items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-panel-3 text-xl">
          {boss?.icon ?? clientIcon(offer.client)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{offer.client}</p>
          <p className="text-[15px] leading-tight font-extrabold">{offer.title}</p>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${difficulty.badge}`}>
          {difficulty.text}
        </span>
      </div>

      {offer.quote && (
        <p className="line-clamp-2 text-xs text-muted italic">“{offer.quote.replace(/^[“"]+|[”"]+$/g, '')}”</p>
      )}

      <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-muted">
        <span className="rounded-full border border-line-2 bg-panel px-2 py-0.5">
          <b className={lang.className}>{lang.icon}</b> {fileName(offer.id, offer.lang)}
        </span>
        <span className="rounded-full border border-line-2 bg-panel px-2 py-0.5">
          📝 {formatNumber(offer.code)} líneas
        </span>
        <span className="rounded-full border border-line-2 bg-panel px-2 py-0.5">⏱ {offer.time} s</span>
        {offer.stack?.map((id) => (
          <span key={id} className="rounded-full border border-line-2 bg-panel px-2 py-0.5" title="Fullstack">
            + <b className={TECH_ICON[id].className}>{TECH_ICON[id].icon}</b> {TECHS.find((t) => t.id === id)?.name}
          </span>
        ))}
        {tier > 1 && (
          <span
            className="rounded-full border border-yellow/40 px-2 py-0.5 text-yellow"
            title="Las tecnologías avanzadas pagan más"
          >
            💰 ×{tier.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
          </span>
        )}
        {speed > 1 && (
          <span
            className="rounded-full border border-green/40 px-2 py-0.5 text-green"
            title="Tu especialización en esta tecnología"
          >
            ⚡ +{Math.round((speed - 1) * 100)}%
          </span>
        )}
      </div>

      <dl className="grid grid-cols-[1.35fr_1fr_1fr] gap-1.5">
        {(
          [
            ['Paga', formatMoney(offer.reward.money), 'text-yellow'],
            ['XP', `+${formatNumber(offer.reward.xp)}`, 'text-purple'],
            ['Rep.', `+${offer.reward.rep} ★`, 'text-cyan'],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="min-w-0 rounded-xl border border-line bg-panel px-2.5 py-1.5">
            <dt className="truncate font-mono text-[10px] text-muted">{label}</dt>
            <dd className={`truncate font-mono text-[13px] font-extrabold ${color}`} title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto">
        {/* Cuánto del plazo te llevaría con tu ritmo de hoy */}
        <div className="h-1.5 overflow-hidden rounded-full bg-panel-3" title="Cuánto del plazo te llevaría">
          <div className={`h-full ${verdict.bar}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-xs">
            <span className={verdict.color}>● {verdict.text}</span>{' '}
            <span className="text-faint">
              ~{Math.ceil(estimate)} s de {offer.time} s
            </span>
          </span>
          <button
            type="button"
            onClick={() => onAccept(offer)}
            disabled={activeFile !== null}
            className="shrink-0 cursor-pointer rounded-xl bg-green px-4 py-2 text-sm font-extrabold text-bg transition hover:brightness-110 disabled:cursor-default disabled:bg-panel-3 disabled:text-faint"
          >
            Aceptar
          </button>
        </div>
      </div>
    </article>
  )
}

/** A la derecha (abajo en el celular): tu ritmo, la reputación, la Captación automática y la pista de tecnologías */
function SidePanel({ perClick, autoRate, rep, autoAccept, onAutoAcceptChange, knowsJs }: OffersScreenProps) {
  const level = repLevel(rep)
  const next = nextRepThreshold(rep)
  const ratio = next === null ? 1 : (rep - REP_LEVELS[level]) / (next - REP_LEVELS[level])
  const nextBoard = next === null ? null : boardSize(level + 1)
  return (
    <aside className="flex flex-col gap-3">
      <div className={PANEL}>
        <p className={LABEL}>Tu ritmo</p>
        <p className="font-mono text-2xl font-extrabold text-green">
          {formatRate(autoRate)} <small className="text-xs font-normal text-muted">líneas/s del equipo</small>
        </p>
        <p className="font-mono text-xs text-muted">+{formatRate(perClick)} líneas por cada clic</p>
      </div>

      <div className={PANEL}>
        <p className={LABEL}>Reputación · {formatNumber(rep)} ★</p>
        <p className="font-mono text-[13px]">
          Ofertas Nv.{level + 1} · <b>{boardSize(level)} en el tablón</b>
        </p>
        <div className="my-2 h-1.5 overflow-hidden rounded-full bg-panel-3">
          <div className="h-full bg-cyan" style={{ width: `${ratio * 100}%` }} />
        </div>
        <p className="font-mono text-[11.5px] text-muted">
          {next === null
            ? 'Nivel máximo: las ofertas más grandes'
            : `${formatNumber(next - rep)} ★ más para Nv.${level + 2}: contratos más grandes${
                nextBoard !== boardSize(level) ? ` y ${nextBoard} ofertas` : ''
              }`}
        </p>
      </div>

      {autoAccept !== null && (
        <label className={`${PANEL} flex cursor-pointer items-center gap-3`}>
          <span className="min-w-0 flex-1">
            <span className={`${LABEL} block`}>📨 Captación automática</span>
            <span className="block text-xs text-muted">
              Acepta sola la que mejor paga entre las que tu equipo termina sin clics
            </span>
          </span>
          <input
            type="checkbox"
            checked={autoAccept}
            onChange={(e) => onAutoAcceptChange(e.target.checked)}
            className="size-5 shrink-0 accent-green"
          />
        </label>
      )}

      {!knowsJs && (
        <p className="rounded-2xl border border-dashed border-line-2 p-3.5 text-xs text-muted">
          🔒 Hay clientes que piden <b className="text-yellow">JavaScript</b>. Aprendelo con XP en Mejoras → Tecnologías
          para desbloquear contratos .js mejor pagos.
        </p>
      )}
    </aside>
  )
}

export default OffersScreen
