// Lo que comparten todos los minijuegos: la barra de tiempo (el reloj está en useCountdown.ts).

/** Cada juego avisa cuántos aciertos tuvo (de 3): el puntaje es aciertos / 3 */
export type GameProps = { onDone: (hits: number) => void }

export function TimeBar({ left, total }: { left: number; total: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
        <div
          className={`h-full transition-[width] duration-100 ${left / total < 0.3 ? 'bg-red' : 'bg-cyan'}`}
          style={{ width: `${(left / total) * 100}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs text-muted">{left.toFixed(1)}s</span>
    </div>
  )
}
