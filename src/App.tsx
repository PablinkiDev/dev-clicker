import { useState } from 'react'
import { FAST_TYPING_MAX_LEVEL, fastTypingCost, linesPerClick } from './game/formulas'

function App() {
  // Estado: lo mínimo que el juego necesita recordar
  const [lines, setLines] = useState(0)
  const [fastTypingLevel, setFastTypingLevel] = useState(0)

  // Valores derivados: se calculan a partir del estado en cada render.
  // No van en useState porque siempre se pueden obtener de lines y fastTypingLevel.
  const perClick = linesPerClick(fastTypingLevel)
  const upgradeCost = fastTypingCost(fastTypingLevel)
  const isMaxLevel = fastTypingLevel >= FAST_TYPING_MAX_LEVEL
  const canBuyUpgrade = !isMaxLevel && lines >= upgradeCost

  function program() {
    setLines((prev) => prev + perClick)
  }

  function buyUpgrade() {
    if (!canBuyUpgrade) return
    setLines((prev) => prev - upgradeCost)
    setFastTypingLevel((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 p-4">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Dev Clicker</h1>
        <p className="font-mono text-sm text-muted">Etapa 1 · Freelancer</p>
      </header>

      <section className="text-center">
        <p className="font-mono text-sm text-faint">// líneas escritas</p>
        <p className="font-mono text-7xl font-extrabold text-green">
          {lines.toLocaleString('es-AR')}
        </p>
      </section>

      <button
        type="button"
        onClick={program}
        className="h-20 w-full max-w-md cursor-pointer rounded-2xl bg-linear-to-b from-[#6dffa0] to-[#2fd36b] text-2xl font-extrabold text-[#062312] shadow-[0_5px_0_#17803f] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#17803f]"
      >
        Programar
        <span className="block font-mono text-xs font-semibold opacity-70">
          +{perClick} {perClick === 1 ? 'línea' : 'líneas'}
        </span>
      </button>

      <section className="w-full max-w-md rounded-xl border border-line bg-panel-2 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">⌨ Escritura veloz</p>
            <p className="text-xs text-muted">+1 línea por clic por nivel</p>
          </div>
          <span className="font-mono text-sm text-muted">
            Nv. {fastTypingLevel}/{FAST_TYPING_MAX_LEVEL}
          </span>
        </div>

        <button
          type="button"
          onClick={buyUpgrade}
          disabled={!canBuyUpgrade}
          className="mt-3 w-full cursor-pointer rounded-lg border border-purple/50 bg-purple/15 py-2 font-mono text-sm font-bold text-purple transition-colors hover:bg-purple/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
        >
          {isMaxLevel ? '✓ Nivel máximo' : `Mejorar · ${upgradeCost} líneas`}
        </button>
      </section>
    </main>
  )
}

export default App
