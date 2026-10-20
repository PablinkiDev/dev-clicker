import { formatDuration, formatMoney } from '../game/format'
import type { SaleRecord } from '../game/prestige'

/** Historial de empresas vendidas: la más reciente arriba */
function SalesHistory({ history }: { history: SaleRecord[] }) {
  if (history.length === 0) return null

  return (
    <>
      <p className="mt-5 mb-2.5 font-mono text-xs text-muted">historial/ · empresas vendidas</p>
      <ol className="flex max-w-xl flex-col gap-2">
        {history.map((sale, i) => (
          <li key={sale.soldAt} className="rounded-xl border border-line bg-panel-2 p-3 font-mono text-xs">
            <p className="mb-1 flex justify-between gap-3">
              <b className="text-text">💼 Empresa n.º {history.length - i}</b>
              <span className="text-muted">{new Date(sale.soldAt).toLocaleDateString('es-AR')}</span>
            </p>
            <p className="text-muted">
              Vendida por <b className="text-yellow">{formatMoney(sale.value)}</b> ·{' '}
              <b className="text-purple">+{sale.tokens} tokens</b>
            </p>
            <p className="text-muted">
              {sale.contractsDone} contratos ({sale.contractsFailed} vencidos) · {sale.teamSize} empleados ·{' '}
              {sale.endless} en modo infinito
              {sale.playTime !== undefined && ` · ${formatDuration(sale.playTime)} jugados`}
            </p>
          </li>
        ))}
      </ol>
    </>
  )
}

export default SalesHistory
