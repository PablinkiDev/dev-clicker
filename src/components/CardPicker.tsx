import { STYLES, getCard, type CardPick } from '../data/cards'

type CardPickerProps = {
  offer: CardPick[]
  /** Cartas que ya elegiste en esta empresa (para ver cómo va tu build) */
  owned: CardPick[]
  /** Primera vez en la carrera: se explica qué son */
  first: boolean
  onPick: (index: number) => void
}

/** 🃏 Elegir una especialización al ascender: 3 cartas, una de cada estilo */
function CardPicker({ offer, owned, first, onPick }: CardPickerProps) {
  return (
    <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Elegí una especialización" className="w-full max-w-3xl">
        <p className="text-center font-mono text-[11px] font-bold tracking-widest text-green uppercase">
          🃏 Especialización
        </p>
        <h2 className="mb-1 text-center text-2xl font-extrabold">Elegí cómo crece tu empresa</h2>
        <p className="mx-auto mb-5 max-w-xl text-center text-sm text-muted">
          {first
            ? 'Cada vez que ascendés elegís una carta. Se suman entre sí y arman tu estilo de juego: más clics, más equipo o un poco de todo. Se pierden al vender la empresa.'
            : 'Se suma a las que ya elegiste en esta empresa.'}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {offer.map((pick, i) => {
            const card = getCard(pick.id)
            if (!card) return null
            const style = STYLES[card.style]
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => onPick(i)}
                className={`group flex cursor-pointer flex-col items-center rounded-2xl border-2 p-5 text-center transition-transform hover:-translate-y-1 ${
                  pick.rare
                    ? 'border-yellow bg-linear-to-b from-yellow/20 to-panel-2 shadow-[0_0_30px_rgba(255,203,107,.35)]'
                    : 'border-line-2 bg-panel-2 hover:border-green/60'
                }`}
              >
                <span className={`font-mono text-[10px] font-bold tracking-wider uppercase ${style.color}`}>
                  {style.icon} {style.name}
                </span>
                {pick.rare && <span className="mt-1 font-mono text-[10px] font-bold text-yellow">✨ RARA</span>}
                <span className="my-3 text-5xl transition-transform group-hover:scale-110">{card.icon}</span>
                <span className="text-lg leading-tight font-extrabold">{card.name}</span>
                <span className="mt-2 text-sm text-muted">{card.text(pick.rare)}</span>
                <span className="mt-4 rounded-lg bg-green px-4 py-1.5 text-sm font-extrabold text-[#062312] opacity-0 transition-opacity group-hover:opacity-100">
                  Elegir
                </span>
              </button>
            )
          })}
        </div>

        {owned.length > 0 && (
          <p className="mt-4 text-center text-xs text-muted">
            Tu build:{' '}
            {owned.map((c) => {
              const card = getCard(c.id)
              return card ? (
                <span key={c.id} className={`mx-1 ${c.rare ? 'text-yellow' : ''}`} title={card.text(c.rare)}>
                  {card.icon} {card.name}
                </span>
              ) : null
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default CardPicker
