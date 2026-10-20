import { useCallback, useEffect, useEffectEvent, useReducer, useState } from 'react'
import ContractCard from './components/ContractCard'
import CodeView from './components/editor/CodeView'
import Minimap from './components/editor/Minimap'
import ActionDock from './components/layout/ActionDock'
import ActivityBar from './components/layout/ActivityBar'
import EconomyHud from './components/layout/EconomyHud'
import EditorTabs from './components/layout/EditorTabs'
import Sidebar from './components/layout/Sidebar'
import StatusBar from './components/layout/StatusBar'
import Terminal from './components/layout/Terminal'
import TitleBar from './components/layout/TitleBar'
import Toast from './components/layout/Toast'
import EditorShop from './components/EditorShop'
import { AgentBar, MenuBar, NanoBar } from './components/layout/EditorNav'
import { getEditor } from './data/editors'
import { SKILLS } from './data/skills'
import { fileName } from './game/format'
import { critChance, skillCost } from './game/formulas'
import { autoRateOf, clickRate } from './game/rates'
import { CLIENT_COOLDOWN_MS, refillOffers } from './game/offers'
import { DARK_MODE_PRICE, createInitialState, gameReducer } from './game/reducer'
import { clearSave, loadGame, saveGame } from './game/save'
import { replaceCandidate, rerollCandidates, type Employee } from './game/team'
import type { Contract } from './game/types'
import OffersScreen from './screens/OffersScreen'
import SkillsScreen from './screens/SkillsScreen'
import SettingsScreen from './screens/SettingsScreen'
import TeamScreen from './screens/TeamScreen'
import CompanyScreen from './screens/CompanyScreen'
import { canAscend, companyValue, contractScale, isEndless, nextStageRequirements } from './game/stages'
import type { View } from './ui'

/** Cada cuántos milisegundos avanza el reloj (10 veces por segundo, GDD §11) */
const TICK_MS = 100

function App() {
  // Todo el estado de la partida vive en un solo objeto; las reglas están en game/reducer.ts.
  // Al abrir el juego se carga la partida guardada; si no hay, arranca una nueva.
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame() ?? createInitialState())
  const {
    code,
    money,
    xp,
    rep,
    skills,
    editor: editorId,
    look: lookId,
    team,
    offers,
    cooldowns,
    contract,
    timeLeft,
    notice,
    log,
  } = state

  // Estado de la interfaz (no es parte de la partida)
  const [view, setView] = useState<View>(() => (state.contract ? 'work' : 'board'))
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')
  const [critPop, setCritPop] = useState<{ id: number; lines: number } | null>(null)

  // Valores derivados
  // editor: el mejor comprado (bonus) · look: el que se ve (aspecto y navegación)
  const editor = getEditor(editorId)
  const look = getEditor(lookId)
  const { ideChrome } = look.features
  const perClick = clickRate(state)
  const auto = autoRateOf(state)
  const isComplete = contract !== null && code >= contract.code
  const isRunning = contract !== null && !isComplete && isVisible
  // Si no hay contrato, la pantalla de código no tiene sentido: se muestra el tablón
  const currentView: View = view === 'work' && !contract ? 'board' : view
  const skillsAvailable = SKILLS.filter(
    (s) => skills[s.id] < s.maxLevel && xp >= skillCost(s.baseCost, skills[s.id]),
  ).length
  const errors = log.filter((entry) => entry.kind === 'error').length
  const isUrgent = isRunning && timeLeft / (contract?.time ?? 1) < 0.3

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

  // Efecto 4: la barra espaciadora programa (o entrega, si el código ya está completo).
  // useEffectEvent: la función siempre ve los valores actuales, pero NO es una dependencia
  // del efecto, así que el listener se agrega una sola vez.
  const onSpace = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== 'Space' || event.repeat || currentView !== 'work' || !contract) return
    event.preventDefault() // que la página no haga scroll
    if (isComplete) deliver()
    else program()
  })

  useEffect(() => {
    window.addEventListener('keydown', onSpace)
    return () => window.removeEventListener('keydown', onSpace)
  }, [])

  function acceptContract(offer: Contract) {
    if (contract) return
    // El tablón nuevo usa azar y la hora, por eso se calcula acá y no dentro del reducer
    const now = Date.now()
    const nextCooldowns = { ...cooldowns, [offer.id]: now + CLIENT_COOLDOWN_MS }
    const remaining = offers.filter((o) => o.uid !== offer.uid)
    dispatch({
      type: 'accept',
      offer,
      offers: refillOffers(remaining, nextCooldowns, offer.id, now, state.tech, state.stage, state.endless),
      cooldowns: nextCooldowns,
    })
    setView('work')
  }

  function hire(candidate: Employee, replaceUid?: string) {
    // Igual que con las ofertas: el candidato que ocupa su lugar se genera acá (azar)
    const candidates = replaceCandidate(state.candidates, candidate, team)
    dispatch({ type: 'hire', uid: candidate.uid, replaceUid, candidates })
  }

  function ascend() {
    // El tablón se rearma entero con contratos de la etapa nueva
    const offers = refillOffers([], cooldowns, contract?.id ?? null, Date.now(), state.tech, state.stage + 1)
    dispatch({ type: 'ascend', offers })
  }

  function sell() {
    // La partida nueva tiene ofertas al azar: se arma acá y el reducer le pasa el prestigio
    dispatch({ type: 'sell', fresh: createInitialState(), now: Date.now() })
    setView('board')
  }

  function program() {
    // El azar se resuelve acá, en el evento; el reducer solo aplica el resultado
    const crit = Math.random() < critChance(skills.criticalCode, editor.critBonus)
    dispatch({ type: 'program', crit })
    if (crit) setCritPop({ id: Date.now(), lines: perClick * editor.critMultiplier })
  }

  function deliver() {
    dispatch({ type: 'deliver' })
    setView('board')
  }

  function resetGame() {
    if (!window.confirm('¿Borrar la partida y empezar de cero? No se puede deshacer.')) return
    clearSave()
    dispatch({ type: 'reset', state: createInitialState() })
    setView('board')
  }

  // useCallback: la misma función entre renders, para que el temporizador del Toast no se reinicie
  const dismissNotice = useCallback(() => dispatch({ type: 'dismissNotice' }), [])

  const activeFile = contract ? fileName(contract.id, contract.lang) : null
  const titles: Record<View, string> = {
    work: activeFile ?? 'ofertas/',
    board: 'ofertas/',
    team: 'equipo/',
    company: 'empresa.json',
    skills: 'mejoras.tree',
    settings: 'settings.json',
  }

  return (
    // data-editor activa la paleta del editor definida en index.css
    <div
      data-editor={look.id}
      data-dark={(state.darkMode.owned && state.darkMode.on) || state.dim ? '' : undefined}
      className="flex h-dvh flex-col overflow-hidden bg-bg font-ui text-text"
    >
      <TitleBar
        editor={look.id}
        title={titles[currentView]}
        modified={contract !== null && code > 0}
        stage={state.stage}
        endlessScale={isEndless(state.stage) ? contractScale(state.stage, state.endless) : null}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {ideChrome && (
          <>
            <ActivityBar
              view={currentView}
              onChange={setView}
              offersCount={offers.length}
              skillsAvailable={skillsAvailable}
              canAscend={canAscend(state)}
            />
            <Sidebar
              contract={contract}
              offers={offers}
              team={team}
              office={state.office}
              money={money}
              onNavigate={setView}
            />
          </>
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {look.features.nav === 'menu' && (
            <MenuBar
              editor={look.id}
              view={currentView}
              onChange={setView}
              darkMode={state.darkMode}
              darkModePrice={DARK_MODE_PRICE}
              onDarkMode={() => dispatch({ type: 'toggleDarkMode' })}
            />
          )}
          <EconomyHud
            money={money}
            xp={xp}
            rep={rep}
            perClick={perClick}
            auto={auto}
            critPercent={Math.round(critChance(skills.criticalCode, editor.critBonus) * 100)}
          />
          {ideChrome && <EditorTabs view={currentView} contract={contract} onChange={setView} />}

          {currentView === 'work' && contract && (
            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                {ideChrome && (
                  <p className="hidden shrink-0 gap-1.5 px-4.5 pt-1.5 font-mono text-[11px] text-faint md:flex">
                    dev-clicker › en-curso › <b className="font-medium text-muted">{activeFile}</b>
                  </p>
                )}
                <ContractCard contract={contract} code={code} timeLeft={timeLeft} />
                <CodeView
                  key={contract.uid}
                  contract={contract}
                  code={code}
                  syntax={look.features.syntax}
                  lineNumbers={look.features.lineNumbers}
                />
              </div>
              {ideChrome && <Minimap code={code} target={contract.code} />}
            </div>
          )}
          {currentView === 'board' && (
            <OffersScreen
              offers={offers}
              perClick={perClick}
              autoRate={auto}
              activeFile={activeFile}
              knowsJs={state.tech.javascript > 0}
              onAccept={acceptContract}
            />
          )}
          {currentView === 'team' && (
            <TeamScreen
              team={team}
              candidates={state.candidates}
              office={state.office}
              stage={state.stage}
              money={money}
              autoRate={auto}
              isWorking={isRunning}
              onHire={hire}
              onReroll={() => dispatch({ type: 'rerollCandidates', candidates: rerollCandidates(team) })}
              onMove={() => dispatch({ type: 'moveOffice' })}
            />
          )}
          {currentView === 'company' && (
            <CompanyScreen
              stage={state.stage}
              requirements={nextStageRequirements(state)}
              scale={contractScale(state.stage, state.endless)}
              endless={state.endless}
              value={companyValue(state.stats.moneyEarned, team)}
              stats={state.stats}
              teamSize={team.length}
              tokens={state.prestige.tokens}
              history={state.prestige.history}
              onAscend={ascend}
              onSell={sell}
            />
          )}
          {currentView === 'settings' && (
            <SettingsScreen
              editor={editor.id}
              look={look.id}
              onLookChange={(id) => dispatch({ type: 'setLook', look: id })}
              dim={state.dim}
              onDimChange={(dim) => dispatch({ type: 'setDim', dim })}
              stats={state.stats}
              onReset={resetGame}
            />
          )}
          {currentView === 'skills' && (
            <SkillsScreen
              skills={skills}
              tech={state.tech}
              xp={xp}
              onBuy={(skill) => dispatch({ type: 'buySkill', skill })}
              onLearn={(tech) => dispatch({ type: 'learnTech', tech })}
              prestige={state.prestige}
              onInvest={(investment) => dispatch({ type: 'invest', investment })}
              tools={<EditorShop editor={editor.id} money={money} onBuy={() => dispatch({ type: 'buyEditor' })} />}
            />
          )}

          <ActionDock
            hasContract={contract !== null}
            isComplete={isComplete}
            isWorkView={currentView === 'work'}
            perClick={perClick}
            onProgram={program}
            onDeliver={deliver}
            critPop={critPop}
          />
          {/* En Cladex el agente ya informa el estado: la terminal se oculta para dejar lugar al código */}
          {look.features.nav !== 'agent' && <Terminal log={log} errors={errors} />}
          {look.features.nav === 'nano' && <NanoBar view={currentView} onChange={setView} />}
          {look.features.nav === 'agent' && (
            <AgentBar
              view={currentView}
              onChange={setView}
              hasContract={contract !== null}
              isComplete={isComplete}
              elapsed={contract ? contract.time - timeLeft : 0}
            />
          )}
        </main>
      </div>

      {ideChrome && (
        <StatusBar
          line={Math.floor(code) + 1}
          timeLeft={contract ? timeLeft : null}
          isUrgent={isUrgent}
          isPaused={contract !== null && !isVisible}
        />
      )}

      {notice && <Toast notice={notice} onDismiss={dismissNotice} />}
    </div>
  )
}

export default App
