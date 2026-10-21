import { BUG_DURATION, BUG_MULTIPLIER } from '../game/bug'

type GoldenBugProps = {
  /** Posición en % del área de juego */
  x: number
  y: number
  onCatch: () => void
}

/** 🐛 El bug dorado: camina por la pantalla; si lo tocás antes de que se escape, el equipo produce el doble */
function GoldenBug({ x, y, onCatch }: GoldenBugProps) {
  return (
    <button
      type="button"
      onClick={onCatch}
      title={`¡Atrapalo! Producción ×${BUG_MULTIPLIER} por ${BUG_DURATION} s`}
      aria-label="Atrapar el bug dorado"
      className="absolute z-30 animate-bug cursor-pointer text-4xl drop-shadow-[0_0_12px_rgba(255,203,107,.9)] select-none hover:scale-125"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="[filter:sepia(1)_saturate(6)_hue-rotate(5deg)_brightness(1.15)]">🐛</span>
    </button>
  )
}

export default GoldenBug
