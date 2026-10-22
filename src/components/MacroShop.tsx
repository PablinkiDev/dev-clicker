import { MACRO_LEVELS, macroCps } from '../data/macro'
import { STAGES } from '../data/stages'
import { formatMoney } from '../game/format'

type MacroShopProps = {
  /** Nivel comprado (0 = no la tenés) */
  level: number
  on: boolean
  money: number
  stage: number
  onBuy: () => void
  onToggle: (on: boolean) => void
}

/** 🤖 Macro de teclado: se compra con dinero y se prende o apaga */
function MacroShop({ level, on, money, stage, onBuy, onToggle }: MacroShopProps) {
  const next = MACRO_LEVELS[level]
  const locked = next !== undefined && stage < next.minStage

  return (
    <div className="rounded-xl border border-line bg-panel-2 p-4">
      <p className="font-bold">🤖 Macro de teclado</p>
      <p className="text-xs text-muted">
        Hace clic sola mientras haya un contrato en curso. Más lenta que vos, pero no se cansa. Sus clics no son
        críticos ni cuentan para tus logros.
      </p>

      {level > 0 && (
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-panel px-3 py-2">
          <span className="font-mono text-sm">
            {macroCps(level)} clic{macroCps(level) > 1 ? 's' : ''}/s ·{' '}
            <b className={on ? 'text-green' : 'text-faint'}>{on ? 'prendida' : 'apagada'}</b>
          </span>
          <input
            type="checkbox"
            checked={on}
            onChange={(event) => onToggle(event.target.checked)}
            className="size-5 cursor-pointer accent-green"
          />
        </label>
      )}

      {next ? (
        <button
          type="button"
          onClick={onBuy}
          disabled={locked || money < next.price}
          className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
        >
          {locked
            ? `🔒 Requiere etapa ${STAGES[next.minStage].name}`
            : `${level === 0 ? 'Instalar' : 'Mejorar a'} ${next.cps} clic${next.cps > 1 ? 's' : ''}/s · ${formatMoney(next.price)}`}
        </button>
      ) : (
        <p className="mt-2 text-xs text-muted">Versión máxima instalada.</p>
      )}
    </div>
  )
}

export default MacroShop
