import ScreenHeader from '../components/ScreenHeader'
import { EDITORS, type EditorId } from '../data/editors'
import { formatMoney } from '../game/format'
import type { Stats } from '../game/reducer'

type SettingsScreenProps = {
  /** Mejor editor comprado */
  editor: EditorId
  /** Editor que se ve */
  look: EditorId
  onLookChange: (look: EditorId) => void
  dim: boolean
  onDimChange: (dim: boolean) => void
  stats: Stats
  onReset: () => void
  onExport: () => void
  /** Recibe el texto del archivo elegido */
  onImport: (text: string) => void
}

function SettingsScreen({
  editor,
  look,
  onLookChange,
  dim,
  onDimChange,
  stats,
  onReset,
  onExport,
  onImport,
}: SettingsScreenProps) {
  const ownedIndex = EDITORS.findIndex((e) => e.id === editor)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⚙" title="Ajustes">
        Elegí con qué editor programar. Es solo estético: los bonus son siempre los del mejor que compraste.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">apariencia/</p>
      <ul className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {EDITORS.map((e, i) => {
          const isOwned = i <= ownedIndex
          const isSelected = e.id === look
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onLookChange(e.id)}
                disabled={!isOwned}
                className={`flex h-full w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left disabled:cursor-default disabled:opacity-50 ${
                  isSelected ? 'border-green bg-green/10' : 'border-line bg-panel-2 enabled:hover:border-line-2'
                }`}
              >
                <span className="font-bold">{e.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {isSelected ? '✓ en uso' : isOwned ? 'usar' : `🔒 ${formatMoney(e.price)}`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mb-2.5 font-mono text-xs text-muted">accesibilidad/</p>
      <label className="mb-6 flex max-w-xl cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-panel-2 px-4 py-3">
        <span>
          <b className="block">Reducir brillo</b>
          <span className="text-xs text-muted">
            Usa colores oscuros en Bloc de notas y Notepad. Siempre gratis: el modo oscuro de $60 es un chiste del
            juego, la accesibilidad no se cobra.
          </span>
        </span>
        <input
          type="checkbox"
          checked={dim}
          onChange={(event) => onDimChange(event.target.checked)}
          className="size-5 shrink-0 cursor-pointer accent-green"
        />
      </label>

      <p className="mb-2.5 font-mono text-xs text-muted">partida/</p>
      <dl className="mb-4 grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-xl border border-line bg-panel-2 p-3.5 font-mono text-xs">
        <dt className="text-muted">Dinero ganado</dt>
        <dd className="text-right text-yellow">{formatMoney(stats.moneyEarned)}</dd>
        <dt className="text-muted">Contratos entregados</dt>
        <dd className="text-right text-green">{stats.contractsDone}</dd>
        <dt className="text-muted">Contratos vencidos</dt>
        <dd className="text-right text-red">{stats.contractsFailed}</dd>
      </dl>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExport}
          className="cursor-pointer rounded-lg border border-line-2 bg-panel-2 px-4 py-2 font-mono text-sm font-bold hover:bg-panel-3"
        >
          ⬇ Exportar partida (.json)
        </button>
        <label className="cursor-pointer rounded-lg border border-line-2 bg-panel-2 px-4 py-2 font-mono text-sm font-bold hover:bg-panel-3">
          ⬆ Importar partida
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = '' // para poder elegir el mismo archivo otra vez
              if (file) onImport(await file.text())
            }}
          />
        </label>
      </div>
      <p className="mb-4 max-w-md text-xs text-muted">
        Sirve de backup o para pasarle tu partida a alguien (por ejemplo, si encontrás un bug).
      </p>

      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer rounded-lg border border-red/50 px-4 py-2 font-mono text-sm font-bold text-red hover:bg-red/10"
      >
        rm -rf partida/ · empezar de cero
      </button>
    </section>
  )
}

export default SettingsScreen
