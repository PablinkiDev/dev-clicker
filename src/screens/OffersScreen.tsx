import { LANG_ICON, TECH_ICON } from '../ui'
import { SPECIAL_RULES } from '../game/offers'
import { TECHS, payTier, specialtyBonus, type TechLevels } from '../data/techs'
import ScreenHeader from '../components/ScreenHeader'
import { estimateSeconds } from '../game/formulas'
import { fileName, formatMoney, formatNumber } from '../game/format'
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
  /** Interruptor de la Captación automática; null si la mejora no está comprada */
  autoAccept: boolean | null
  onAutoAcceptChange: (on: boolean) => void
  onAccept: (offer: Contract) => void
}

const DIFFICULTY_LABEL: Record<Difficulty, { text: string; className: string }> = {
  easy: { text: 'Fácil', className: 'bg-green/15 text-green' },
  mid: { text: 'Media', className: 'bg-yellow/15 text-yellow' },
  hard: { text: 'Difícil', className: 'bg-red/15 text-red' },
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'mid', 'hard']

function OffersScreen({
  offers,
  perClick,
  autoRate,
  activeFile,
  knowsJs,
  tech,
  onAccept,
  autoAccept,
  onAutoAcceptChange,
}: OffersScreenProps) {
  // Ordenamos una copia: nunca hay que modificar (mutar) las props ni el estado
  const sorted = [...offers].sort(
    // Los especiales primero; después de fácil a difícil
    (a, b) =>
      Number(!!b.special) - Number(!!a.special) ||
      DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
  )

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      {activeFile ? (
        <ScreenHeader icon="</>" title="Tablón de ofertas">
          Estás trabajando en <b className="font-mono text-text">{activeFile}</b>. Terminalo antes de aceptar otra.
        </ScreenHeader>
      ) : (
        <ScreenHeader icon="</>" title="Ningún contrato abierto">
          Elegí una oferta para empezar. <b className="font-mono text-text">El reloj no corre</b> hasta que la aceptes.
        </ScreenHeader>
      )}

      {autoAccept !== null && (
        <label className="mb-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={autoAccept}
            onChange={(e) => onAutoAcceptChange(e.target.checked)}
            className="size-4 accent-green"
          />
          <span>
            📨 <b>Captación automática</b>{' '}
            <span className="text-muted">
              · acepta la que mejor paga entre las que el equipo termina solo en el 80 % del plazo
            </span>
          </span>
        </label>
      )}

      <p className="mb-2.5 flex justify-between font-mono text-xs text-muted">
        <span>ofertas/</span>
        <span className="text-faint">siempre hay una fácil, una media y una difícil</span>
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {sorted.map((offer) => {
          const label = DIFFICULTY_LABEL[offer.difficulty]
          // La especialización acelera los contratos de tu tecnología (D3)
          const speed = specialtyBonus(tech, offer.lang)
          const tier = payTier(offer.lang, offer.stack)
          // "Solo a mano": el equipo no ayuda
          const team = offer.special === 'clicksOnly' ? 0 : autoRate
          const estimate = estimateSeconds(offer.code, perClick * speed, team * speed)
          const special = offer.special && SPECIAL_RULES[offer.special]
          const ratio = estimate / offer.time
          const verdict =
            ratio < 0.7
              ? { text: 'Cómodo', className: 'text-green' }
              : ratio < 1
                ? { text: 'Ajustado', className: 'text-yellow' }
                : { text: 'Arriesgado', className: 'text-red' }

          return (
            <li key={offer.uid}>
              <button
                type="button"
                onClick={() => onAccept(offer)}
                disabled={activeFile !== null}
                className={`h-full w-full cursor-pointer rounded-xl border p-3.5 text-left transition enabled:hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60 ${
                  special
                    ? 'border-yellow/70 bg-linear-to-b from-yellow/12 to-panel-2 shadow-[0_0_0_3px_rgba(255,203,107,.12)] enabled:hover:border-yellow'
                    : 'border-line bg-panel-2 enabled:hover:border-cyan/50'
                }`}
              >
                {special && (
                  <p className="mb-1.5 font-mono text-[11px] font-bold text-yellow" title={special.detail}>
                    ⭐ Contrato especial · {special.name}
                    <span className="block font-normal text-muted">{special.detail}</span>
                  </p>
                )}
                <p className="mb-1 truncate font-mono text-[11px] text-muted">
                  <span className={LANG_ICON[offer.lang ?? 'html'].className}>
                    {LANG_ICON[offer.lang ?? 'html'].icon}
                  </span>{' '}
                  {fileName(offer.id, offer.lang)}
                </p>
                {offer.stack && (
                  <p className="mb-1.5 flex flex-wrap gap-1 font-mono text-[10px] text-muted">
                    <span className="py-px">fullstack:</span>
                    {offer.stack.map((id) => (
                      <span key={id} className="rounded bg-panel-3 px-1.5 py-px whitespace-nowrap">
                        + <span className={TECH_ICON[id].className}>{TECH_ICON[id].icon}</span>{' '}
                        {TECHS.find((t) => t.id === id)?.name}
                      </span>
                    ))}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">{offer.client}</p>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${label.className}`}>
                    {label.text}
                  </span>
                </div>
                <p className="font-bold">{offer.title}</p>
                <p className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-muted">
                  <span>{formatNumber(offer.code)} líneas</span>
                  <span>⏱ {offer.time} s</span>
                  <span className="text-yellow">{formatMoney(offer.reward.money)}</span>
                  <span className="text-purple">+{formatNumber(offer.reward.xp)} XP</span>
                  {tier > 1 && (
                    <span className="text-yellow" title="Las tecnologías avanzadas pagan más">
                      💰 ×{tier.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                    </span>
                  )}
                  {speed > 1 && (
                    <span className="text-green" title="Tu especialización en esta tecnología">
                      ⚡ +{Math.round((speed - 1) * 100)}%
                    </span>
                  )}
                </p>
                <p className="mt-2 border-t border-dashed border-line pt-2 font-mono text-xs text-muted">
                  <span className={verdict.className}>● {verdict.text}</span> · ~{Math.ceil(estimate)} s de {offer.time}{' '}
                  s
                </p>
              </button>
            </li>
          )
        })}
      </ul>

      {!knowsJs && (
        <p className="mt-4 rounded-xl border border-dashed border-line-2 px-4 py-3 font-mono text-xs text-muted">
          🔒 Hay clientes que piden <b className="text-yellow">JavaScript</b>. Aprendelo con XP en Mejoras →
          tecnologías/ para desbloquear contratos .js mejor pagos.
        </p>
      )}
    </section>
  )
}

export default OffersScreen
