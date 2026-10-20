import { LANG_ICON } from '../ui'
import ScreenHeader from '../components/ScreenHeader'
import { estimateSeconds } from '../game/formulas'
import { fileName } from '../game/format'
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
  onAccept: (offer: Contract) => void
}

const DIFFICULTY_LABEL: Record<Difficulty, { text: string; className: string }> = {
  easy: { text: 'Fácil', className: 'bg-green/15 text-green' },
  mid: { text: 'Media', className: 'bg-yellow/15 text-yellow' },
  hard: { text: 'Difícil', className: 'bg-red/15 text-red' },
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'mid', 'hard']

function OffersScreen({ offers, perClick, autoRate, activeFile, knowsJs, onAccept }: OffersScreenProps) {
  // Ordenamos una copia: nunca hay que modificar (mutar) las props ni el estado
  const sorted = [...offers].sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
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

      <p className="mb-2.5 flex justify-between font-mono text-xs text-muted">
        <span>ofertas/</span>
        <span className="text-faint">siempre hay una fácil, una media y una difícil</span>
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {sorted.map((offer) => {
          const label = DIFFICULTY_LABEL[offer.difficulty]
          const estimate = estimateSeconds(offer.code, perClick, autoRate)
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
                className="h-full w-full cursor-pointer rounded-xl border border-line bg-panel-2 p-3.5 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-cyan/50 disabled:cursor-default disabled:opacity-60"
              >
                <p className="mb-1 truncate font-mono text-[11px] text-muted">
                  <span className={LANG_ICON[offer.lang ?? 'html'].className}>
                    {LANG_ICON[offer.lang ?? 'html'].icon}
                  </span>{' '}
                  {fileName(offer.id, offer.lang)}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">{offer.client}</p>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${label.className}`}>
                    {label.text}
                  </span>
                </div>
                <p className="font-bold">{offer.title}</p>
                <p className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-muted">
                  <span>{offer.code} líneas</span>
                  <span>⏱ {offer.time} s</span>
                  <span className="text-yellow">${offer.reward.money.toLocaleString('es-AR')}</span>
                  <span className="text-purple">+{offer.reward.xp} XP</span>
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
