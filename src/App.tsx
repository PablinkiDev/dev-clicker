import { useEffect, useRef, useState } from 'react'
import ContractCard from './components/ContractCard'
import OfferBoard from './components/OfferBoard'
import {
  DEVELOPER_PRICE,
  FAILURE_REP_LOSS,
  FAST_TYPING_MAX_LEVEL,
  addCode,
  autoRate,
  failureMoneyLoss,
  failureXp,
  fastTypingCost,
  linesPerClick,
} from './game/formulas'
import { CLIENT_COOLDOWN_MS, createInitialOffers, refillOffers, type Cooldowns } from './game/offers'
import type { Contract } from './game/types'

/** Mensaje que se muestra después de entregar o fallar un contrato */
type Notice = {
  kind: 'success' | 'error'
  text: string
}

/** Cada cuántos milisegundos avanza el reloj (10 veces por segundo, GDD §11) */
const TICK_MS = 100

function App() {
  // Estado: lo mínimo que el juego necesita recordar
  const [code, setCode] = useState(0)
  const [money, setMoney] = useState(0)
  const [xp, setXp] = useState(0)
  const [rep, setRep] = useState(0)
  const [fastTypingLevel, setFastTypingLevel] = useState(0)
  const [developers, setDevelopers] = useState(0)
  const [offers, setOffers] = useState<Contract[]>(createInitialOffers)
  const [cooldowns, setCooldowns] = useState<Cooldowns>({})
  const [contract, setContract] = useState<Contract | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')
  const [notice, setNotice] = useState<Notice | null>(null)

  // Ref: el tiempo "real" que usa el reloj. Cambiarlo NO provoca un render.
  const timeLeftRef = useRef(0)

  // Valores derivados: se calculan a partir del estado en cada render
  const perClick = linesPerClick(fastTypingLevel)
  const auto = autoRate(developers)
  const canHireDeveloper = money >= DEVELOPER_PRICE
  const isActive = contract !== null
  const isComplete = contract !== null && code >= contract.code
  const isRunning = isActive && !isComplete && isVisible
  const upgradeCost = fastTypingCost(fastTypingLevel)
  const isMaxLevel = fastTypingLevel >= FAST_TYPING_MAX_LEVEL
  const canBuyUpgrade = !isMaxLevel && xp >= upgradeCost

  // Efecto 1: escuchar si la pestaña se oculta o vuelve a verse
  useEffect(() => {
    function handleVisibility() {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    // Limpieza: React la ejecuta cuando el componente se desmonta
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Efecto 2: el reloj del contrato. Solo existe mientras isRunning sea true.
  useEffect(() => {
    if (!isRunning || !contract) return

    let last = performance.now()
    const id = setInterval(() => {
      // Medimos el tiempo real transcurrido: los intervalos no son exactos
      const now = performance.now()
      const elapsed = (now - last) / 1000
      last = now

      // El equipo escribe código solo mientras haya un contrato activo (GDD §5)
      if (auto > 0) {
        setCode((prev) => addCode(prev, auto * elapsed, contract.code))
      }

      timeLeftRef.current = Math.max(0, timeLeftRef.current - elapsed)
      setTimeLeft(timeLeftRef.current)

      if (timeLeftRef.current === 0) {
        // Se venció el plazo (GDD §4): pérdidas leves y un poco de XP
        const lostXp = failureXp(contract.reward.xp)
        setMoney((prev) => prev - failureMoneyLoss(prev))
        setRep((prev) => Math.max(0, prev - FAILURE_REP_LOSS))
        setXp((prev) => prev + lostXp)
        setCode(0)
        setContract(null)
        setNotice({
          kind: 'error',
          text: `Se venció el plazo: ${contract.client} contrató a un primo. −5 % de dinero · −${FAILURE_REP_LOSS} ★ · +${lostXp} XP por la experiencia`,
        })
      }
    }, TICK_MS)

    // Limpieza: se ejecuta cuando isRunning cambia (pausa, entrega, fallo) o al desmontar
    return () => clearInterval(id)
  }, [isRunning, contract, auto])

  function acceptContract(offer: Contract) {
    if (contract) return
    // El cliente aceptado entra en cooldown y su lugar en el tablón se completa al instante
    const nextCooldowns = { ...cooldowns, [offer.id]: Date.now() + CLIENT_COOLDOWN_MS }
    const remaining = offers.filter((o) => o.uid !== offer.uid)
    setCooldowns(nextCooldowns)
    setOffers(refillOffers(remaining, nextCooldowns, offer.id, Date.now()))

    timeLeftRef.current = offer.time
    setTimeLeft(offer.time)
    setCode(0)
    setContract(offer)
    setNotice(null)
  }

  function program() {
    if (!contract || isComplete) return
    setCode((prev) => addCode(prev, perClick, contract.code))
  }

  function deliver() {
    if (!contract || !isComplete) return
    const { reward } = contract
    setMoney((prev) => prev + reward.money)
    setXp((prev) => prev + reward.xp)
    setRep((prev) => prev + reward.rep)
    setCode(0) // el código no se acumula entre contratos (GDD §3)
    setContract(null)
    setNotice({
      kind: 'success',
      text: `${contract.client} pagó: +$${reward.money} · +${reward.xp} XP · +${reward.rep} ★`,
    })
  }

  function hireDeveloper() {
    if (!canHireDeveloper) return
    setMoney((prev) => prev - DEVELOPER_PRICE)
    setDevelopers((prev) => prev + 1)
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

      {notice && (
        <p
          role="status"
          className={`w-full max-w-md rounded-lg px-4 py-3 text-sm font-semibold ${
            notice.kind === 'success'
              ? 'border border-green/40 bg-green/10 text-green'
              : 'border border-red/60 bg-[#b4233a] text-white'
          }`}
        >
          {notice.kind === 'success' ? '✓ ' : '✗ '}
          {notice.text}
        </p>
      )}

      {isActive && !isVisible && (
        <p className="font-mono text-sm text-muted">⏸ Pestaña oculta: el tiempo está en pausa</p>
      )}

      {contract ? (
        <>
          <ContractCard contract={contract} code={code} timeLeft={timeLeft} isActive />
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
        </>
      ) : (
        <OfferBoard offers={offers} perClick={perClick} autoRate={auto} onAccept={acceptContract} />
      )}

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

      <section className="w-full max-w-md rounded-xl border border-line bg-panel-2 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">🧑‍💻 Desarrollador ★</p>
            <p className="text-xs text-muted">Escribe +2 líneas/seg mientras haya un contrato activo</p>
          </div>
          <span className="text-right font-mono text-sm text-muted">
            {developers} en el equipo
            <span className="block text-green">+{auto} l/s</span>
          </span>
        </div>

        <button
          type="button"
          onClick={hireDeveloper}
          disabled={!canHireDeveloper}
          className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
        >
          Contratar · ${DEVELOPER_PRICE.toLocaleString('es-AR')}
        </button>
      </section>
    </main>
  )
}

export default App
