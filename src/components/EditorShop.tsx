import { getEditor, nextEditor, type EditorId } from '../data/editors'
import { formatMoney } from '../game/format'

type EditorShopProps = {
  editor: EditorId
  money: number
  onBuy: () => void
}

/** Tarjeta para comprar el siguiente editor (se paga con dinero, no con XP) */
function EditorShop({ editor, money, onBuy }: EditorShopProps) {
  const current = getEditor(editor)
  const next = nextEditor(editor)

  return (
    <div className="rounded-xl border border-line bg-panel-2 p-4">
      <p className="text-xs text-muted">
        Editor actual: <b className="text-text">{current.name}</b>
      </p>
      {next ? (
        <>
          <p className="mt-2 font-bold">⬆ {next.name}</p>
          <p className="text-xs text-muted">{next.bonusText}</p>
          <button
            type="button"
            onClick={onBuy}
            disabled={money < next.price}
            className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
          >
            Instalar · {formatMoney(next.price)}
          </button>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">Ya tenés el mejor editor disponible. Por ahora.</p>
      )}
    </div>
  )
}

export default EditorShop
