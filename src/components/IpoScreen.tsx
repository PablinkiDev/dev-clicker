import { ACHIEVEMENTS } from '../data/achievements'
import { ARTIFACTS } from '../data/artifacts'
import { formatDuration, formatMoney, formatNumber } from '../game/format'
import { careerPlayTime, tokensEarned } from '../game/prestige'
import type { GameState } from '../game/reducer'

/** 🦄 El final del juego (F6): tu carrera en números, los créditos y la opción de seguir como leyenda */
function IpoScreen({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const { records, prestige } = state
  const moneyEarned = prestige.history.reduce((total, sale) => total + sale.moneyEarned, state.stats.moneyEarned)
  const contracts = prestige.history.reduce((total, sale) => total + sale.contractsDone, state.stats.contractsDone)
  const stats: [string, string][] = [
    ['⏱ Tiempo jugado', formatDuration(careerPlayTime(prestige, state.stats.playTime))],
    ['💼 Empresas vendidas', String(prestige.sales)],
    ['💰 Dinero ganado', formatMoney(moneyEarned)],
    ['📄 Contratos entregados', formatNumber(contracts)],
    ['⌨️ Líneas escritas', formatNumber(records.lines)],
    ['🖱 Clics', formatNumber(records.clicks)],
    ['👹 Jefes derrotados', String(records.bosses)],
    ['🪙 Tokens ganados', String(tokensEarned(prestige))],
    ['🏆 Logros', `${records.unlocked.length}/${ACHIEVEMENTS.length}`],
    ['🏺 Artefactos', `${Object.keys(records.artifacts).length}/${ARTIFACTS.length}`],
  ]

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,#3b2a5c,#0b0d14_70%)] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Salida a la bolsa"
        className="mx-auto max-w-2xl py-8 text-center"
      >
        <p className="animate-pop text-8xl">🦄</p>
        <p className="mt-4 font-mono text-xs font-bold tracking-[0.3em] text-yellow uppercase">git tag v1.0.0-IPO</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">¡Tu empresa salió a la bolsa!</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Empezaste con Nano, una compu y una tía que quería una web. Hoy tu empresa cotiza en bolsa y nadie sabe bien
          qué hace. Sos una leyenda.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-2 text-left sm:grid-cols-2">
          {stats.map(([label, value]) => (
            <li key={label} className="rounded-xl border border-line-2 bg-panel-2/80 px-4 py-3">
              <span className="block text-xs text-muted">{label}</span>
              <span className="block font-mono text-lg font-extrabold">{value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-line-2 bg-panel-2/60 p-4 text-sm text-muted">
          <p className="font-mono text-xs font-bold tracking-widest text-faint uppercase">Créditos</p>
          <p className="mt-2">
            <b className="text-text">Dev Clicker</b> · un juego de Agustín
          </p>
          <p>Gracias por jugar, por cada clic y por cada deploy un viernes a las 18:00.</p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 cursor-pointer rounded-xl bg-yellow px-8 py-3 font-extrabold text-[#2b1a00]"
        >
          🦄 Seguir jugando como leyenda
        </button>
        <p className="mt-2 text-xs text-faint">
          Todo lo que juntaste se queda. Todavía quedan logros y artefactos por completar.
        </p>
      </div>
    </div>
  )
}

export default IpoScreen
