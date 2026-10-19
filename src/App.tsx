import { useState } from 'react'
import ContractCard from './components/ContractCard'
import { FIRST_CONTRACT } from './data/contracts'
import { FAST_TYPING_MAX_LEVEL, addCode, fastTypingCost, linesPerClick } from './game/formulas'

function App() {
  // Estado: lo mínimo que el juego necesita recordar
  const [code, setCode] = useState(0)
  const [money, setMoney] = useState(0)
  const [xp, setXp] = useState(0)
  const [rep, setRep] = useState(0)
  const [fastTypingLevel, setFastTypingLevel] = useState(0)

  // Por ahora hay un único contrato que se repite; en el commit de ofertas pasará a ser estado
  const contract = FIRST_CONTRACT

  // Valores derivados: se calculan a partir del estado en cada render
  const perClick = linesPerClick(fastTypingLevel)
  const isComplete = code >= contract.code
  const upgradeCost = fastTypingCost(fastTypingLevel)
  const isMaxLevel = fastTypingLevel >= FAST_TYPING_MAX_LEVEL
  const canBuyUpgrade = !isMaxLevel && xp >= upgradeCost

  function program() {
    if (isComplete) return
    setCode((prev) => addCode(prev, perClick, contract.code))
  }

  function deliver() {
    if (!isComplete) return
    const { reward } = contract
    setMoney((prev) => prev + reward.money)
    setXp((prev) => prev + reward.xp)
    setRep((prev) => prev + reward.rep)
    setCode(0) // el código no se acumula entre contratos (GDD §3)
  }

  function buyUpgrade() {
    if (!canBuyUpgrade) return
    setXp((prev) => prev - upgradeCost)
    setFastTypingLevel((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Dev Clicker</h1>
        <p className="font-mono text-sm text-muted">Etapa 1 · Freelancer</p>
      </header>

      <section className="grid w-full max-w-md grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-line bg-panel-2 py-2">
          <p className="text-[10px] tracking-widest text-muted uppercase">Dinero</p>
          <p className="font-mono text-xl font-extrabold text-yellow">${money.toLocaleString('es-AR')}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel-2 py-2">
          <p className="text-[10px] tracking-widest text-muted uppercase">Experiencia</p>
          <p className="font-mono text-xl font-extrabold text-purple">{xp.toLocaleString('es-AR')}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel-2 py-2">
          <p className="text-[10px] tracking-widest text-muted uppercase">Reputación</p>
          <p className="font-mono text-xl font-extrabold text-cyan">{rep.toLocaleString('es-AR')}</p>
        </div>
      </section>

      <ContractCard contract={contract} code={code} />

      <div className="grid w-full max-w-md grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          onClick={program}
          disabled={isComplete}
          className="h-20 cursor-pointer rounded-2xl bg-linear-to-b from-[#6dffa0] to-[#2fd36b] text-2xl font-extrabold text-[#062312] shadow-[0_5px_0_#17803f] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#17803f] disabled:cursor-default disabled:from-panel-2 disabled:to-panel-2 disabled:text-faint disabled:shadow-[0_5px_0_#0c0f19] disabled:active:translate-y-0"
        >
          Programar
          <span className="block font-mono text-xs font-semibold opacity-70">
            {isComplete ? 'objetivo alcanzado' : `+${perClick} ${perClick === 1 ? 'línea' : 'líneas'}`}
          </span>
        </button>

        <button
          type="button"
          onClick={deliver}
          disabled={!isComplete}
          className="h-20 cursor-pointer rounded-2xl bg-linear-to-b from-[#ffd98a] to-[#ffb938] px-5 font-mono font-bold text-[#2b1a00] shadow-[0_5px_0_#a8700f] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#a8700f] disabled:cursor-default disabled:from-panel-2 disabled:to-panel-2 disabled:text-faint disabled:shadow-none disabled:active:translate-y-0"
        >
          git push
          <span className="block font-ui text-xs font-semibold opacity-80">Entregar</span>
        </button>
      </div>

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
          {isMaxLevel ? '✓ Nivel máximo' : `Mejorar · ${upgradeCost} XP`}
        </button>
      </section>
    </main>
  )
}

export default App
