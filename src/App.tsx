import { useEffect, useReducer, useState } from 'react'
import ContractCard from './components/ContractCard'
import OfferBoard from './components/OfferBoard'
import SkillCard from './components/SkillCard'
import { SKILLS } from './data/skills'
import { CRIT_MULTIPLIER, DEVELOPER_PRICE, ROOM_CAPACITY, autoRate, critChance, linesPerClick } from './game/formulas'
import { CLIENT_COOLDOWN_MS, refillOffers } from './game/offers'
import { createInitialState, gameReducer } from './game/reducer'
import { clearSave, loadGame, saveGame } from './game/save'
import type { Contract } from './game/types'

/** Cada cuántos milisegundos avanza el reloj (10 veces por segundo, GDD §11) */
const TICK_MS = 100

function App() {
  // Todo el estado del juego vive en un solo objeto; las reglas están en game/reducer.ts
  // Al abrir el juego se carga la partida guardada; si no hay, arranca una nueva
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame() ?? createInitialState())
  const { code, money, xp, rep, skills, developers, offers, cooldowns, contract, timeLeft, notice } =
    state

  // Estado de la interfaz (no es parte de la partida): si la pestaña está visible
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')
  // Último crítico, para mostrar el "+N" flotante. El id cambia en cada crítico y reinicia la animación
  const [critPop, setCritPop] = useState<{ id: number; lines: number } | null>(null)

  // Valores derivados: se calculan a partir del estado en cada render
  const perClick = linesPerClick(skills.fastTyping)
  const auto = autoRate(developers)
  const isTeamFull = developers >= ROOM_CAPACITY
  const canHireDeveloper = !isTeamFull && money >= DEVELOPER_PRICE
  const isActive = contract !== null
  const isComplete = contract !== null && code >= contract.code
  const isRunning = isActive && !isComplete && isVisible

  // Efecto 1: escuchar si la pestaña se oculta o vuelve a verse
  useEffect(() => {
    function handleVisibility() {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Efecto 2: guardar la partida cada vez que cambia el estado
  useEffect(() => {
    saveGame(state)
  }, [state])

  // Efecto 3: el reloj. Solo avisa cuánto tiempo pasó; el reducer decide qué significa.
  useEffect(() => {
    if (!isRunning) return

    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      dispatch({ type: 'tick', elapsed: (now - last) / 1000 })
      last = now
    }, TICK_MS)

    return () => clearInterval(id)
  }, [isRunning])

  function acceptContract(offer: Contract) {
    if (contract) return
    // El tablón nuevo usa azar y la hora, por eso se calcula acá y no dentro del reducer
    const now = Date.now()
    const nextCooldowns = { ...cooldowns, [offer.id]: now + CLIENT_COOLDOWN_MS }
    const remaining = offers.filter((o) => o.uid !== offer.uid)
    dispatch({
      type: 'accept',
      offer,
      offers: refillOffers(remaining, nextCooldowns, offer.id, now),
      cooldowns: nextCooldowns,
    })
  }

  function resetGame() {
    if (!window.confirm('¿Borrar la partida y empezar de cero? No se puede deshacer.')) return
    clearSave()
    dispatch({ type: 'reset', state: createInitialState() })
  }

  function program() {
    // El azar se resuelve acá, en el evento; el reducer solo aplica el resultado
    const crit = Math.random() < critChance(skills.criticalCode)
    dispatch({ type: 'program', crit })
    if (crit) setCritPop({ id: Date.now(), lines: perClick * CRIT_MULTIPLIER })
  }

  const deliver = () => dispatch({ type: 'deliver' })
  const hireDeveloper = () => dispatch({ type: 'hireDeveloper' })

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
          <div className="relative grid w-full max-w-md grid-cols-[1fr_auto] gap-3">
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

            {critPop && (
              <span
                key={critPop.id}
                className="pointer-events-none absolute -top-3 left-1/3 -translate-x-1/2 animate-float-up font-mono text-xl font-extrabold text-yellow"
              >
                ⚡ ¡Crítico! +{critPop.lines}
              </span>
            )}

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

      <section className="w-full max-w-md">
        <p className="mb-2 font-mono text-xs text-muted">mejoras/ · se pagan con XP</p>
        <ul className="flex flex-col gap-3">
          {SKILLS.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              level={skills[skill.id]}
              xp={xp}
              onBuy={() => dispatch({ type: 'buySkill', skill: skill.id })}
            />
          ))}
        </ul>
      </section>

      <section className="w-full max-w-md rounded-xl border border-line bg-panel-2 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">🧑‍💻 Desarrollador ★</p>
            <p className="font-mono text-xs text-muted">
              🏠 Habitación · {1 + developers}/{1 + ROOM_CAPACITY} puestos
            </p>
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
          {isTeamFull ? '🪑 Habitación llena' : `Contratar · $${DEVELOPER_PRICE.toLocaleString('es-AR')}`}
        </button>
      </section>

      <button
        type="button"
        onClick={resetGame}
        className="cursor-pointer font-mono text-xs text-faint underline-offset-4 hover:text-red hover:underline"
      >
        rm -rf partida/ · empezar de cero
      </button>
    </main>
  )
}

export default App
