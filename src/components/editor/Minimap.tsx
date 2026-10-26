import { formatNumber } from '../../game/format'
type MinimapProps = {
  code: number
  target: number
  /** 🟧 Sublime (H5.8): más ancho y con el recuadro de lo que se está viendo */
  wide?: boolean
}

const COLORS = ['bg-red', 'bg-yellow', 'bg-green', 'bg-purple', 'bg-blue', 'bg-cyan']
/** Como mucho dibujamos esta cantidad de filas; si el contrato es más largo, cada fila agrupa varias líneas */
const MAX_ROWS = 60

/** El minimapa del editor funciona como barra de progreso del contrato */
function Minimap({ code, target, wide = false }: MinimapProps) {
  const rows = Math.min(target, MAX_ROWS)
  const filled = Math.floor((code / target) * rows)

  return (
    <aside
      className={`flex w-10 shrink-0 flex-col border-l border-line px-1.5 py-2 md:px-2.5 ${wide ? 'bg-bg md:w-28' : 'bg-panel md:w-20'}`}
    >
      <p className="mb-2 text-center font-mono text-[10px] text-faint">
        <b className="block text-xs text-text md:text-sm">{formatNumber(Math.floor(code))}</b>/{formatNumber(target)}
      </p>
      <div className="relative flex min-h-0 flex-1 flex-col gap-[3px] overflow-hidden">
        {wide && (
          // Lo que "se ve" en el editor: las últimas filas escritas (cada fila mide 4px + 3px de espacio)
          <span
            className="pointer-events-none absolute -inset-x-1 rounded-sm border border-text/15 bg-text/8 transition-[top] duration-150"
            style={{ top: `${Math.max(0, filled - 10) * 7}px`, height: `${12 * 7}px` }}
          />
        )}
        {Array.from({ length: rows }, (_, i) => (
          <i
            key={i}
            className={`block h-1 shrink-0 rounded-sm transition-colors ${i < filled ? COLORS[i % COLORS.length] : 'bg-panel-3'}`}
            // Anchos "al azar" pero fijos, para que parezca código
            style={{ width: `${35 + ((i * 37) % 60)}%`, marginLeft: `${i % 4 ? (i * 13) % 20 : 0}%` }}
          />
        ))}
      </div>
    </aside>
  )
}

export default Minimap
