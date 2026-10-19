import { estimateSeconds } from '../game/formulas'
import type { Contract, Difficulty } from '../game/types'

type OfferBoardProps = {
  offers: Contract[]
  perClick: number
  onAccept: (offer: Contract) => void
}

const DIFFICULTY_LABEL: Record<Difficulty, { text: string; className: string }> = {
  easy: { text: 'Fácil', className: 'bg-green/15 text-green' },
  mid: { text: 'Media', className: 'bg-yellow/15 text-yellow' },
  hard: { text: 'Difícil', className: 'bg-red/15 text-red' },
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'mid', 'hard']

function OfferBoard({ offers, perClick, onAccept }: OfferBoardProps) {
  // Ordenamos una copia: nunca hay que modificar (mutar) las props ni el estado
  const sorted = [...offers].sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
  )

  return (
    <section className="w-full max-w-md">
      <p className="mb-2 flex justify-between font-mono text-xs text-muted">
        <span>ofertas/</span>
        <span className="text-faint">el reloj arranca al aceptar</span>
      </p>

      <ul className="flex flex-col gap-3">
        {sorted.map((offer) => {
          const label = DIFFICULTY_LABEL[offer.difficulty]
          const estimate = estimateSeconds(offer.code, perClick)
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
                className="w-full cursor-pointer rounded-xl border border-line bg-panel-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan/50"
              >
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
                  <span className={verdict.className}>● {verdict.text}</span> · ~{Math.ceil(estimate)} s de {offer.time} s
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default OfferBoard
