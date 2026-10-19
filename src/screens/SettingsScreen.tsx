import ScreenHeader from '../components/ScreenHeader'
import { EDITORS, type EditorId } from '../data/editors'
import { formatMoney } from '../game/format'

type SettingsScreenProps = {
  /** Mejor editor comprado */
  editor: EditorId
  /** Editor que se ve */
  look: EditorId
  onLookChange: (look: EditorId) => void
  onReset: () => void
}

function SettingsScreen({ editor, look, onLookChange, onReset }: SettingsScreenProps) {
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
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left disabled:cursor-default disabled:opacity-50 ${
                  isSelected ? 'border-green bg-green/10' : 'border-line bg-panel-2 enabled:hover:border-line-2'
                }`}
              >
                <span className="font-bold">{e.name}</span>
                <span className="font-mono text-xs text-muted">
                  {isSelected ? '✓ en uso' : isOwned ? 'usar' : `🔒 ${formatMoney(e.price)}`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mb-2.5 font-mono text-xs text-muted">partida/</p>
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
