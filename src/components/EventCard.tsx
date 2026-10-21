import type { GameEvent } from '../data/events'

type EventCardProps = {
  event: GameEvent
  /** Elegir una opción (solo eventos con elección) */
  onChoose: (index: 0 | 1) => void
  onClose: () => void
}

const TONE: Record<GameEvent['tone'], { border: string; label: string; text: string }> = {
  good: { border: 'border-green/50', label: 'Buena noticia', text: 'text-green' },
  bad: { border: 'border-red/50', label: 'Mala noticia', text: 'text-red' },
  choice: { border: 'border-yellow/60', label: 'Decisión', text: 'text-yellow' },
}

/** Tarjeta de un evento al azar: abajo a la derecha, con la frase, el efecto y (si hay) dos opciones */
function EventCard({ event, onChoose, onClose }: EventCardProps) {
  const tone = TONE[event.tone]
  return (
    <div
      role="dialog"
      aria-label={event.title}
      className={`absolute right-3 bottom-28 z-30 w-[min(22rem,calc(100%-1.5rem))] rounded-2xl border bg-panel-2 p-4 shadow-2xl md:right-5 md:bottom-32 ${tone.border}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{event.icon}</span>
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-[10px] font-bold tracking-wider uppercase ${tone.text}`}>{tone.label}</p>
          <p className="font-extrabold leading-tight">{event.title}</p>
          <p className="mt-1 text-xs text-muted italic">{event.quote}</p>
        </div>
        {!event.options && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer text-faint hover:text-text"
          >
            ✕
          </button>
        )}
      </div>

      {event.options ? (
        <div className="mt-3 flex flex-col gap-2">
          {event.options.map((option, i) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onChoose(i as 0 | 1)}
              className="cursor-pointer rounded-xl border border-line-2 bg-panel px-3 py-2 text-left transition-colors hover:border-yellow/60 hover:bg-yellow/5"
            >
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="block font-mono text-[11px] text-muted">{option.detail}</span>
            </button>
          ))}
          <p className="font-mono text-[10px] text-faint">
            Si no elegís en 20 s: “{event.options[event.safe ?? 1].label}”
          </p>
        </div>
      ) : (
        <p className={`mt-3 rounded-lg bg-panel px-3 py-2 font-mono text-xs font-bold ${tone.text}`}>{event.detail}</p>
      )}
    </div>
  )
}

export default EventCard
