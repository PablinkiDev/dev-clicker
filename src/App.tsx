import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useState } from 'react'
import ContractCard from './components/ContractCard'
import CodeView from './components/editor/CodeView'
import Minimap from './components/editor/Minimap'
import ActionDock, { type AbilitySlot } from './components/layout/ActionDock'
import { ABILITIES, type AbilityId } from './data/abilities'
import { isActive } from './game/modifiers'
import ActivityBar from './components/layout/ActivityBar'
import EconomyHud from './components/layout/EconomyHud'
import EditorTabs from './components/layout/EditorTabs'
import Sidebar from './components/layout/Sidebar'
import StatusBar from './components/layout/StatusBar'
import Terminal from './components/layout/Terminal'
import TitleBar from './components/layout/TitleBar'
import Toast from './components/layout/Toast'
import GoldenBug from './components/GoldenBug'
import { bugVisible, nextBugDelay } from './game/bug'
import EventCard from './components/EventCard'
import AchievementToast from './components/AchievementToast'
import FeatureCard from './components/FeatureCard'
import DevPanel from './components/DevPanel'
import { HelpModal } from './components/HelpModal'
import {
  applyAudioSettings,
  loadAudioSettings,
  playSfx,
  saveAudioSettings,
  unlockAudio,
  type AudioSettings,
} from './audio/audio'
import { MinigameInvite, MinigameModal } from './components/Minigame'
import { FEATURES, isViewVisible } from './data/features'
import { MINIGAMES, MINIGAME_FIRST_AT, nextMinigameDelay, type MinigameId } from './data/minigames'
import AchievementList from './components/AchievementList'
import { ACHIEVEMENTS } from './data/achievements'
import { eventContextOf, nextEventDelay, pickEvent, rollOutcome, type GameEvent } from './data/events'
import EditorShop from './components/EditorShop'
import MacroShop from './components/MacroShop'
import { AgentBar, MenuBar, NanoBar } from './components/layout/EditorNav'
import { EDITORS, getEditor } from './data/editors'
import { STAGES } from './data/stages'
import { officeCapacity } from './data/offices'
import { SKILLS, missingSkillRequirements } from './data/skills'
import { TECHS, missingRequirements } from './data/techs'
import { currentGoal, nextPurchase } from './game/goals'
import { fileName } from './game/format'
import { skillCost } from './game/formulas'
import { autoRateOf, clickRate, critChanceOf, critMultiplier, luckOf, macroRateOf } from './game/rates'
import { drawCards } from './data/cards'
import CardPicker from './components/CardPicker'
import ChallengePicker from './components/ChallengePicker'
import IpoScreen from './components/IpoScreen'
import MascotWalker from './components/MascotWalker'
import PurchaseBurst from './components/PurchaseBurst'
import InboxPanel from './components/InboxPanel'
import CareerStats from './components/CareerStats'
import { unreadCount } from './game/inbox'
import { newsOf } from './game/news'
import { tutorialStep } from './game/tutorial'
import { getChallenge } from './data/challenges'
import { focusMultiplier, isFocused } from './game/focus'
import { CLIENT_COOLDOWN_MS, createBossOffer, pickAutoOffer, refillOffers } from './game/offers'
import { offerContextOf } from './game/offerContext'
import { DARK_MODE_PRICE, createInitialState, gameReducer, type GameState } from './game/reducer'
import { clearSave, exportGame, importGame, loadGame, saveGame } from './game/save'
import {
  internSurpriseChance,
  nextInternDelay,
  replaceCandidate,
  rerollCandidates,
  rerollPrice,
  type Employee,
} from './game/team'
import type { Contract } from './game/types'
import OffersScreen from './screens/OffersScreen'
import SkillsScreen from './screens/SkillsScreen'
import SettingsScreen from './screens/SettingsScreen'
import TeamScreen from './screens/TeamScreen'
import CompanyScreen from './screens/CompanyScreen'
import SetupScreen from './screens/SetupScreen'
import { rollArtifact } from './data/artifacts'
import { canAscend, companyValue, contractScale, isEndless, nextStageRequirements } from './game/stages'
import { VIEWS, type View } from './ui'

/** Cada cuántos milisegundos avanza el reloj (10 veces por segundo, GDD §11) */
const TICK_MS = 100

/** Máximo de segundos que puede avanzar el juego de un saque (pestaña frenada o compu suspendida) */
const MAX_ELAPSED = 120

/** Cuántas cosas compraste (para el sonido y las chispas de compra) */
const purchasesOf = (s: GameState) =>
  Object.values(s.skills).reduce((a, b) => a + b, 0) +
  Object.values(s.tech).reduce((a, b) => a + b, 0) +
  Object.values(s.prestige.investments).reduce((a, b) => a + b, 0) +
  s.team.length +
  s.office +
  s.records.replacements +
  s.macro +
  s.records.boxesBought +
  EDITORS.findIndex((e) => e.id === s.editor) +
  (s.darkMode.owned ? 1 : 0)

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
  const [critPop, setCritPop] = useState<{ id: number; lines: number } | null>(null)

  // Valores derivados
  // editor: el mejor comprado (bonus) · look: el que se ve (aspecto y navegación)
  const editor = getEditor(editorId)
  const look = getEditor(lookId)
  const { ideChrome } = look.features
  // Reloj de la Concentración: solo hace falta mientras está activa o recargándose
  const [now, setNow] = useState(() => Date.now())
  // También corre mientras hay modificadores activos (bug dorado, eventos), para mostrar sus segundos
  const focusBusy =
    now < state.focus.readyAt ||
    state.modifiers.some((m) => now < m.endsAt) ||
    Object.values(state.abilities).some((a) => now < a.readyAt)
  useEffect(() => {
    if (!focusBusy) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [focusBusy])
  const focusing = isFocused(state.focus, now)
  const focusInfo =
    skills.focus > 0
      ? {
          active: focusing,
          mult: focusMultiplier(skills.flowState),
          seconds: Math.ceil(((focusing ? state.focus.endsAt : state.focus.readyAt) - now) / 1000),
        }
      : null

  // Ganancia por minuto: cada 5 s se anota lo ganado en la partida y se compara con hace ~5 minutos
  // También se mide tu ritmo de clics (últimos 30 s): las ofertas nuevas se dimensionan con él
  const samples = useRef<{ t: number; money: number; xp: number; clicks: number }[]>([])
  const [perMinute, setPerMinute] = useState<{ money: number; xp: number } | null>(null)
  const [clicksPerSecond, setClicksPerSecond] = useState(3)
  const sampleEarnings = useEffectEvent(() => {
    const t = Date.now()
    const point = { t, money: state.stats.moneyEarned, xp: state.stats.xpEarned, clicks: state.records.clicks }
    const recent = samples.current.find((s) => t - s.t <= 30_000 && s.clicks <= point.clicks)
    if (recent && t - recent.t >= 10_000)
      setClicksPerSecond(Math.min(6, Math.max(1, (point.clicks - recent.clicks) / ((t - recent.t) / 1000))))
    // Si lo ganado bajó (se vendió la empresa o se importó una partida), se empieza de cero
    const previous = samples.current.filter((s) => t - s.t <= 5 * 60_000 && s.money <= point.money)
    samples.current = [...previous, point]
    const first = samples.current[0]
    const minutes = (t - first.t) / 60_000
    setPerMinute(
      minutes >= 0.25 ? { money: (point.money - first.money) / minutes, xp: (point.xp - first.xp) / minutes } : null,
    )
  })
  useEffect(() => {
    sampleEarnings()
    const id = setInterval(sampleEarnings, 5000)
    return () => clearInterval(id)
  }, [])
  const perClick = clickRate(state, now) * (focusing ? focusMultiplier(skills.flowState) : 1)
  const auto = autoRateOf(state, now)
  const activeMods = state.modifiers
    .filter((m) => isActive(m, now))
    .map((m) => ({ ...m, seconds: Math.ceil((m.endsAt - now) / 1000) }))
  // Con qué se generan las ofertas nuevas: tecnologías, etapa, modo infinito y reputación
  const offerContext = offerContextOf(state, clicksPerSecond, now)
  const isComplete = contract !== null && code >= contract.code
  // El juego sigue aunque la pestaña esté oculta (D4); con el juego cerrado, no avanza
  const isRunning = contract !== null && !isComplete
  // Si no hay contrato, la pantalla de código no tiene sentido: se muestra el tablón
  // 🔓 Pantallas visibles: las que todavía no se desbloquearon no aparecen en ningún menú
  const features = state.records.features
  const views = VIEWS.filter((v) => isViewVisible(v, features))
  const wanted: View = view === 'work' && !contract ? 'board' : view
  const currentView: View = views.includes(wanted) ? wanted : 'board'
  const skillsAvailable = SKILLS.filter(
    (s) =>
      skills[s.id] < s.maxLevel &&
      !missingSkillRequirements(s, skills, state.stage) &&
      xp >= skillCost(s.baseCost, skills[s.id], s.minStage),
  ).length
  const techsAvailable = TECHS.filter(
    (t) =>
      state.tech[t.id] < t.maxLevel &&
      !missingRequirements(t, state.tech, state.stage) &&
      xp >= skillCost(t.baseCost, state.tech[t.id], t.minStage),
  ).length
  // 🧭 Tutorial de la primera partida (C2): qué señalar ahora
  const tutorial = tutorialStep(state, skillsAvailable + techsAvailable)
  const errors = log.filter((entry) => entry.kind === 'error').length
  const isUrgent = isRunning && timeLeft / (contract?.time ?? 1) < 0.3

  // Reloj del tiempo jugado: mide el tiempo real entre llamadas, porque con la pestaña oculta
  // el navegador frena los intervalos (pueden correr una vez por minuto)
  useEffect(() => {
    let last = Date.now()
    let session = 0 // segundos desde que se abrió el juego (para "¿Quién necesita dormir?")
    const id = setInterval(() => {
      const now = Date.now()
      const seconds = Math.min(MAX_ELAPSED, (now - last) / 1000)
      session += seconds
      dispatch({ type: 'playTime', seconds, session })
      last = now
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // 🔊 Audio (D10): arranca con el primer clic o tecla (los navegadores no dejan sonar antes)
  const [audio, setAudio] = useState<AudioSettings>(loadAudioSettings)
  function changeAudio(next: AudioSettings) {
    setAudio(next)
    saveAudioSettings(next)
    applyAudioSettings(next)
  }
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Efectos de sonido: se comparan el estado anterior y el nuevo, así no hay que tocar cada acción
  const previous = useRef(state)
  useEffect(() => {
    const before = previous.current
    previous.current = state
    if (before === state) return
    const { records: r0, stats: s0 } = before
    const { records: r1, stats: s1 } = state
    // Importar o empezar de cero: silencio
    if (r1.clicks < r0.clicks) return
    if (r1.unlocked.length > r0.unlocked.length) playSfx('achievement')
    else if (state.stage > before.stage || state.prestige.sales > before.prestige.sales) playSfx('levelUp')
    else if (r1.contracts > r0.contracts) playSfx('deliver')
    else if (s1.contractsFailed > s0.contractsFailed) playSfx('fail')
    else if (r1.bugs > r0.bugs) playSfx('bug')
    else if (purchasesOf(state) > purchasesOf(before)) playSfx('buy')
    else if (r1.clicks > r0.clicks) playSfx('click')
  }, [state])

  // Efecto 2: guardar la partida cada vez que cambia el estado
  useEffect(() => {
    saveGame(state)
  }, [state])

  // 🛠 Panel de desarrollo: velocidad del reloj (siempre 1 fuera de npm run dev)
  const [devSpeed, setDevSpeed] = useState(1)

  // Efecto 3: el reloj. Solo avisa cuánto tiempo pasó; el reducer decide qué significa.
  useEffect(() => {
    if (!isRunning) return

    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      // Tope por si la compu se suspendió: no se "juega" mientras está dormida
      dispatch({ type: 'tick', elapsed: Math.min(MAX_ELAPSED, ((now - last) / 1000) * devSpeed), now: Date.now() })
      last = now
    }, TICK_MS)

    return () => clearInterval(id)
  }, [isRunning, devSpeed])

  // 🔓 Funcionalidades nuevas: se anuncian de a una y marcan su pantalla con ● hasta visitarla
  const seenFeatures = useRef(features)
  const [featureQueue, setFeatureQueue] = useState<string[]>([])
  const [freshViews, setFreshViews] = useState<View[]>([])
  useEffect(() => {
    const before = new Set(seenFeatures.current)
    seenFeatures.current = features
    // Si la lista se achicó (empezar de cero o importar), no hay nada que anunciar
    const fresh = features.filter((id) => !before.has(id))
    if (fresh.length === 0 || features.length < before.size) return
    setFeatureQueue((q) => [...q, ...fresh])
    const newViews = FEATURES.filter((f) => fresh.includes(f.id) && f.view).map((f) => f.view as View)
    setFreshViews((v) => [...new Set([...v, ...newViews])])
  }, [features])

  /** Ir a una pantalla (y sacarle el ● de nuevo) */
  function navigate(next: View) {
    setView(next)
    setFreshViews((v) => v.filter((x) => x !== next))
  }

  // 👹 Cliente jefe: cuando la cuenta llega a cero, aparece en el tablón (la oferta usa azar: se arma acá)
  const bossDue = state.stage >= 1 && state.bossCountdown <= 0 && !offers.some((o) => o.boss) && !contract?.boss
  const spawnBoss = useEffectEvent(() => {
    const offer = createBossOffer(offerContext)
    if (offer) dispatch({ type: 'spawnBoss', offer })
  })
  useEffect(() => {
    if (bossDue) spawnBoss()
  }, [bossDue])

  // 🦄 Pantalla final de la IPO (se abre al salir a la bolsa)
  const [ipoOpen, setIpoOpen] = useState(false)
  /** 🐈 Para que el panel de dev haga pasear a la mascota ya (cambia la key del componente) */
  const [mascotSummon, setMascotSummon] = useState(0)

  // ❓ Ayuda: botón en el panel de arriba o F1
  const [helpOpen, setHelpOpen] = useState(false)
  // 🆕 Lo nuevo de cada pantalla (H4): se marca como visto al salir de ella
  const news = newsOf(state)
  const markSeen = useCallback((keys: string[]) => dispatch({ type: 'markSeen', keys }), [])
  // Puntito en el menú: pantallas recién desbloqueadas o con algo nuevo adentro
  const newsViews: View[] = [
    ...(news.tech.length + news.personal.length + news.company.length + news.prestige.length > 0
      ? (['skills'] as const)
      : []),
    ...(news.team.length > 0 ? (['team'] as const) : []),
    ...(news.profile.length > 0 ? (['setup'] as const) : []),
  ]
  const dotViews = [...new Set([...freshViews, ...newsViews])].filter((v) => v !== currentView)
  /** 🔔 Centro de notificaciones (H2) */
  const [inboxOpen, setInboxOpen] = useState(false)
  useEffect(() => {
    const onF1 = (event: KeyboardEvent) => {
      if (event.key !== 'F1') return
      event.preventDefault() // que el navegador no abra su propia ayuda
      setHelpOpen(true)
    }
    window.addEventListener('keydown', onF1)
    return () => window.removeEventListener('keydown', onF1)
  }, [])

  // Efecto 4: la barra espaciadora programa (o entrega, si el código ya está completo).
  // useEffectEvent: la función siempre ve los valores actuales, pero NO es una dependencia
  // del efecto, así que el listener se agrega una sola vez.
  const onSpace = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== 'Space' || event.repeat || currentView !== 'work' || !contract || helpOpen) return
    // Escribiendo en un campo (Typing race) o jugando un minijuego, la barra no programa
    if (event.target instanceof HTMLInputElement || minigame?.playing) return
    event.preventDefault() // que la página no haga scroll
    if (isComplete) deliver()
    else program()
  })

  useEffect(() => {
    window.addEventListener('keydown', onSpace)
    return () => window.removeEventListener('keydown', onSpace)
  }, [])

  /** switchView: ir al código al aceptar (no cuando acepta la Captación automática) */
  function acceptContract(offer: Contract, switchView = true) {
    if (contract) return
    // El tablón nuevo usa azar y la hora, por eso se calcula acá y no dentro del reducer
    const now = Date.now()
    const nextCooldowns = { ...cooldowns, [offer.id]: now + CLIENT_COOLDOWN_MS }
    const remaining = offers.filter((o) => o.uid !== offer.uid)
    dispatch({
      type: 'accept',
      offer,
      offers: refillOffers(remaining, nextCooldowns, offer.id, now, offerContext),
      cooldowns: nextCooldowns,
    })
    if (switchView) setView('work')
  }

  // Captación automática: sin contrato, espera un momento (para que se vea) y acepta la mejor oferta viable
  const autoAccepting = state.skills.autoAccept > 0 && state.autoAccept && !contract
  const acceptAuto = useEffectEvent(() => {
    const offer = pickAutoOffer(offers, auto)
    if (offer) acceptContract(offer, false)
  })
  useEffect(() => {
    if (!autoAccepting) return
    const id = setTimeout(acceptAuto, 1500)
    return () => clearTimeout(id)
  }, [autoAccepting, offers, auto])

  function hire(candidate: Employee, replaceUid?: string) {
    // Igual que con las ofertas: el candidato que ocupa su lugar se genera acá (azar)
    const candidates = replaceCandidate(state.candidates, candidate, team, state.stage)
    dispatch({ type: 'hire', uid: candidate.uid, replaceUid, candidates })
  }

  function ascend() {
    // El tablón se rearma entero con contratos de la etapa nueva
    const offers = refillOffers([], cooldowns, contract?.id ?? null, Date.now(), {
      ...offerContext,
      stage: state.stage + 1,
    })
    // Y llegan candidatos nuevos, con las estrellas que permite la etapa nueva
    dispatch({
      type: 'ascend',
      offers,
      candidates: rerollCandidates(team, state.stage + 1, skills.headhunter),
      cardOffer: drawCards({ ...state, stage: state.stage + 1 }),
    })
  }

  function sell() {
    // La partida nueva tiene ofertas al azar: se arma acá y el reducer le pasa el prestigio
    dispatch({ type: 'sell', fresh: createInitialState(), now: Date.now() })
    setView('board')
  }

  // 🐛 Bug dorado: aparece cada 2–4 min en un lugar al azar y se escapa a los pocos segundos
  // (Ojo de halcón: aparece más seguido y se queda más)
  const [bug, setBug] = useState<{ id: number; x: number; y: number } | null>(null)
  const hawkEye = skills.hawkEye
  useEffect(() => {
    const id = setTimeout(
      () => {
        if (bug) setBug(null)
        else setBug({ id: Date.now(), x: 10 + Math.random() * 70, y: 15 + Math.random() * 55 })
      },
      bug ? bugVisible(hawkEye) * 1000 : nextBugDelay(hawkEye),
    )
    return () => clearTimeout(id)
  }, [bug, hawkEye])

  function catchBug() {
    const t = Date.now()
    setNow(t)
    dispatch({ type: 'catchBug', now: t, fast: bug !== null && t - bug.id <= 2000 })
    setBug(null)
  }

  // 🎓 Pasantes (G1): cada 1–2 min, uno al azar sorprende o mete un bug (solo con un contrato en curso)
  const internCount = state.team.filter((e) => e.role === 'intern').length
  const [internTick, setInternTick] = useState(0)
  useEffect(() => {
    if (internCount === 0 || !isRunning) return
    const id = setTimeout(() => {
      const interns = state.team.filter((e) => e.role === 'intern')
      const intern = interns[Math.floor(Math.random() * interns.length)]
      if (intern) {
        const surprise = Math.random() < internSurpriseChance(intern.stars)
        dispatch({ type: 'intern', uid: intern.uid, surprise })
        playSfx(surprise ? 'notify' : 'lose')
      }
      setInternTick((n) => n + 1)
    }, nextInternDelay())
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se reprograma solo al cambiar la cantidad o al terminar uno
  }, [internCount, isRunning, internTick])

  // 🎲 Eventos al azar (D6): cada 3–6 min, nunca en los primeros 5 min de una partida
  const [event, setEvent] = useState<GameEvent | null>(null)
  const lastEventId = useRef<string | null>(null)
  // Sube cada vez que hay que volver a programar un evento sin que haya cambiado `event`
  const [eventRetry, setEventRetry] = useState(0)

  /** Despacha los efectos de un evento ya resuelto (el azar y los candidatos se arman acá) */
  function applyEvent(e: GameEvent, effects: NonNullable<GameEvent['effects']>, text: string, bet?: 'won' | 'lost') {
    const t = Date.now()
    setNow(t)
    const candidates = effects.some((x) => x.kind === 'candidates')
      ? rerollCandidates(team, Math.min(4, state.stage + 1), skills.headhunter) // mejores que lo normal
      : undefined
    dispatch({ type: 'applyEvent', text, icon: e.icon, effects, now: t, candidates, tone: e.tone, bet })
  }

  function chooseEventOption(index: 0 | 1) {
    if (!event?.options) return
    const option = event.options[index]
    if (option.outcomes) {
      const outcome = rollOutcome(option.outcomes, luckOf(state))
      // El primer resultado es siempre el bueno: si salió ese, la apuesta se ganó
      const bet = outcome === option.outcomes[0] ? 'won' : 'lost'
      applyEvent(event, outcome.effects, `${event.title}: ${outcome.text}`, bet)
    } else {
      applyEvent(event, option.effects ?? [], `${event.title}: ${option.label}`)
    }
    setEvent(null)
  }

  const triggerEvent = useEffectEvent(() => {
    // No se pisa con un minijuego
    if (state.stats.playTime < 300 || minigame) {
      setEventRetry((n) => n + 1) // todavía no: se vuelve a programar
      return
    }
    const e = pickEvent(eventContextOf(state), lastEventId.current, luckOf(state))
    lastEventId.current = e.id
    if (!e.options) applyEvent(e, e.effects ?? [], `${e.title}: ${e.detail}`)
    setEvent(e)
    playSfx('notify')
  })
  // Sin evento en pantalla: programa el próximo. Con evento: lo cierra (o elige la opción segura) a su tiempo
  const expireEvent = useEffectEvent(() => {
    if (event?.options) chooseEventOption(event.safe ?? 1)
    else setEvent(null)
  })
  useEffect(() => {
    if (!event) {
      const id = setTimeout(triggerEvent, nextEventDelay())
      return () => clearTimeout(id)
    }
    const id = setTimeout(expireEvent, event.options ? 20_000 : 8_000)
    return () => clearTimeout(id)
  }, [event, eventRetry])

  // 🎮 Minijuegos (D9): cada 6–10 min llega una invitación opcional
  const [minigame, setMinigame] = useState<{ game: MinigameId; playing: boolean } | null>(null)
  const lastMinigame = useRef<MinigameId | null>(null)
  const [minigameRetry, setMinigameRetry] = useState(0)
  const triggerMinigame = useEffectEvent(() => {
    // Tampoco se pisa con un evento
    if (state.stats.playTime < MINIGAME_FIRST_AT || event || !features.includes('minigames')) {
      setMinigameRetry((n) => n + 1)
      return
    }
    const options = MINIGAMES.filter((m) => m.id !== lastMinigame.current)
    const game = options[Math.floor(Math.random() * options.length)].id
    lastMinigame.current = game
    setMinigame({ game, playing: false })
    playSfx('notify')
  })
  useEffect(() => {
    if (minigame) return
    const id = setTimeout(triggerMinigame, nextMinigameDelay())
    return () => clearTimeout(id)
  }, [minigame, minigameRetry])

  function finishMinigame(score: number) {
    const t = Date.now()
    setNow(t)
    dispatch({ type: 'minigame', score, now: t })
    playSfx(score > 0 ? 'win' : 'lose')
  }

  // 🤖 Macro de teclado (E4): hace clic sola mientras haya un contrato sin terminar
  const macroRate = macroRateOf(state)
  useEffect(() => {
    if (macroRate === 0 || !isRunning) return
    const id = setInterval(
      () => dispatch({ type: 'program', crit: false, now: Date.now(), macro: true }),
      1000 / macroRate,
    )
    return () => clearInterval(id)
  }, [macroRate, isRunning])

  // --- 🛠 Acciones del panel de desarrollo ---
  function devStage(stage: number) {
    const offers = refillOffers([], {}, null, Date.now(), { ...offerContext, stage })
    // La oficina mínima que pide la etapa, para no quedar en una combinación imposible
    const office = Math.max(state.office, STAGES[stage].requires?.office ?? 0)
    dispatch({
      type: 'dev',
      patch: {
        stage,
        office,
        offers,
        candidates: rerollCandidates(team, stage, skills.headhunter),
        contract: null,
        code: 0,
      },
    })
  }

  function devMaxTrees() {
    const max = <T extends { id: string; maxLevel: number }>(items: T[]) =>
      Object.fromEntries(items.map((i) => [i.id, i.maxLevel]))
    dispatch({
      type: 'dev',
      patch: { skills: { ...skills, ...max(SKILLS) }, tech: { ...state.tech, ...max(TECHS) } },
    })
  }

  function devEvent() {
    const e = pickEvent(eventContextOf(state), lastEventId.current, luckOf(state))
    lastEventId.current = e.id
    if (!e.options) applyEvent(e, e.effects ?? [], `${e.title}: ${e.detail}`)
    setEvent(e)
  }

  // ⚡ Barra de habilidades: el Foco (tecla 1) y las habilidades activas aprendidas (teclas 2–5)
  const abilitySlots: AbilitySlot[] = []
  if (focusInfo)
    abilitySlots.push({
      id: 'focus',
      icon: '🎯',
      name: 'Concentración',
      key: '1',
      label: 'Foco',
      description: `×${focusInfo.mult} líneas por clic`,
      status: focusInfo.active ? 'active' : focusInfo.seconds > 0 ? 'cooldown' : 'ready',
      seconds: Math.max(0, focusInfo.seconds),
    })
  for (const a of ABILITIES) {
    const level = skills[a.skill]
    if (level === 0) continue
    const timer = state.abilities[a.id]
    const status = now < timer.endsAt ? 'active' : now < timer.readyAt ? 'cooldown' : 'ready'
    abilitySlots.push({
      id: a.id,
      icon: a.icon,
      name: a.name,
      key: a.key,
      label: a.name.split(' ')[0],
      description: a.describe(level),
      status,
      seconds: Math.ceil(((status === 'active' ? timer.endsAt : timer.readyAt) - now) / 1000),
    })
  }

  function activateAbility(id: string) {
    const t = Date.now()
    setNow(t)
    if (id === 'focus') dispatch({ type: 'focus', now: t })
    else dispatch({ type: 'ability', id: id as AbilityId, now: t })
  }

  // Teclas 1–5 para las habilidades (no mientras escribís en un campo ni con la ayuda abierta)
  const onAbilityKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || helpOpen || minigame?.playing || event.target instanceof HTMLInputElement) return
    const slot = abilitySlots.find((a) => a.key === event.key)
    if (slot && slot.status === 'ready') activateAbility(slot.id)
  })
  useEffect(() => {
    window.addEventListener('keydown', onAbilityKey)
    return () => window.removeEventListener('keydown', onAbilityKey)
  }, [])

  function program() {
    // El azar se resuelve acá, en el evento; el reducer solo aplica el resultado
    const crit = Math.random() < critChanceOf(state)
    dispatch({ type: 'program', crit, now: Date.now() })
    if (crit) setCritPop({ id: Date.now(), lines: perClick * critMultiplier(state) })
  }

  function deliver() {
    dispatch({ type: 'deliver' })
    setView('board')
  }

  function exportSave() {
    // Se arma un archivo en memoria y se "clickea" un link de descarga
    const blob = new Blob([exportGame(state)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dev-clicker-${new Date().toISOString().slice(0, 10)}.devclicker`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importSave(text: string) {
    const imported = importGame(text)
    if (!imported) {
      window.alert('Ese archivo no es una partida válida de Dev Clicker.')
      return
    }
    if (!window.confirm('¿Reemplazar tu partida actual por la importada? No se puede deshacer.')) return
    dispatch({
      type: 'reset',
      state: {
        ...imported.state,
        tampered: imported.state.tampered || imported.tampered,
        notice: imported.tampered
          ? {
              kind: 'error',
              text: 'git blame: detectamos cambios sin commitear en esta partida 👀 Te la cargamos igual.',
            }
          : null,
        log: [{ id: 1, kind: 'info', text: 'Partida importada. git pull exitoso.' }],
      },
    })
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
    setup: 'setup.desk',
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
        companyName={state.company.name}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {ideChrome && (
          <>
            <ActivityBar
              views={views}
              fresh={dotViews}
              view={currentView}
              onChange={navigate}
              offersCount={offers.length}
              skillsAvailable={skillsAvailable}
              canAscend={canAscend(state)}
            />
            <Sidebar
              contract={contract}
              offers={offers}
              team={team}
              capacity={officeCapacity(state.office, skills.homeOffice)}
              showTeam={views.includes('team')}
              money={money}
              company={state.company}
              onNavigate={navigate}
            />
          </>
        )}

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {bug && <GoldenBug key={bug.id} x={bug.x} y={bug.y} onCatch={catchBug} />}
          {event && <EventCard event={event} onChoose={chooseEventOption} onClose={() => setEvent(null)} />}
          {minigame &&
            (minigame.playing ? (
              <MinigameModal game={minigame.game} onFinish={finishMinigame} onClose={() => setMinigame(null)} />
            ) : (
              <MinigameInvite
                game={minigame.game}
                onPlay={() => setMinigame({ ...minigame, playing: true })}
                onSkip={() => setMinigame(null)}
              />
            ))}
          {look.features.nav === 'menu' && (
            <MenuBar
              views={views}
              fresh={dotViews}
              editor={look.id}
              view={currentView}
              onChange={navigate}
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
            critPercent={Math.round(critChanceOf(state) * 100)}
            moneyPerMinute={perMinute?.money ?? null}
            xpPerMinute={perMinute?.xp ?? null}
            moneyEarned={state.stats.moneyEarned}
            nextPurchase={nextPurchase(state)}
            upgradesAvailable={skillsAvailable + techsAvailable}
            showUpgradeTutorial={tutorial === 'upgrade' && currentView !== 'skills'}
            focus={focusInfo}
            modifiers={activeMods}
            goal={currentGoal(state)}
            onNavigate={navigate}
            onHelp={() => setHelpOpen(true)}
            unread={unreadCount(state.inbox)}
            onInbox={() => {
              setInboxOpen(true)
              dispatch({ type: 'readInbox' })
            }}
          />
          {ideChrome && <EditorTabs views={views} view={currentView} contract={contract} onChange={navigate} />}

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
              tech={state.tech}
              onAccept={acceptContract}
              autoAccept={state.skills.autoAccept > 0 ? state.autoAccept : null}
              onAutoAcceptChange={(on) => dispatch({ type: 'setAutoAccept', on })}
              showTutorial={tutorial === 'offer'}
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
              onReroll={() =>
                dispatch({
                  type: 'rerollCandidates',
                  candidates: rerollCandidates(team, state.stage, skills.headhunter),
                })
              }
              rerollPrice={rerollPrice(state.stage, state.rerolls)}
              homeOffice={skills.homeOffice}
              codeReview={skills.codeReview}
              onMove={() => dispatch({ type: 'moveOffice' })}
              profile={state.profile}
              news={news.team}
              onSeen={markSeen}
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
              achievements={<AchievementList state={state} />}
              careerStats={<CareerStats state={state} />}
              achievementsCount={`${state.records.unlocked.length}/${ACHIEVEMENTS.length}`}
              cards={state.cards}
              challenge={state.challenge}
              sales={state.prestige.sales}
              ipoDone={state.records.ipoAt > 0}
              company={state.company}
              onRename={(company) => dispatch({ type: 'setCompany', company })}
              onIpo={() => {
                if (state.records.ipoAt > 0) return setIpoOpen(true) // ya saliste: solo mirar tu carrera
                if (
                  !window.confirm('¿Sacar tu empresa a la bolsa? Es el final del juego (después podés seguir jugando).')
                )
                  return
                dispatch({ type: 'ipo', now: Date.now() })
                setIpoOpen(true)
                playSfx('levelUp')
              }}
            />
          )}
          {currentView === 'setup' && (
            <SetupScreen
              artifacts={state.records.artifacts}
              boxes={state.records.boxes}
              tokens={state.prestige.tokens}
              boxesBought={state.records.boxesBought}
              onOpen={() => {
                // El azar se resuelve acá; el reducer solo suma el artefacto
                const artifact = rollArtifact(state.records.artifacts)
                if (artifact) dispatch({ type: 'openBox', artifact })
                return artifact
              }}
              onBuy={() => dispatch({ type: 'buyBox' })}
              profile={state.profile}
              unlocked={state.records.unlocked}
              news={news.profile}
              onSeen={markSeen}
              onProfile={(profile) => dispatch({ type: 'setProfile', profile })}
              showArtifacts={features.includes('artifacts')}
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
              onExport={exportSave}
              onImport={importSave}
              audio={audio}
              onAudioChange={changeAudio}
            />
          )}
          {currentView === 'skills' && (
            <SkillsScreen
              features={features}
              skills={skills}
              tech={state.tech}
              stage={state.stage}
              xp={xp}
              onBuy={(skill) => dispatch({ type: 'buySkill', skill })}
              onLearn={(tech) => dispatch({ type: 'learnTech', tech })}
              prestige={state.prestige}
              onInvest={(investment) => dispatch({ type: 'invest', investment })}
              news={news}
              onSeen={markSeen}
              tools={
                <div className="flex flex-col gap-3">
                  <EditorShop
                    editor={editor.id}
                    money={money}
                    stage={state.stage}
                    nanoOnly={getChallenge(state.challenge)?.nanoOnly === true}
                    onBuy={() => dispatch({ type: 'buyEditor' })}
                  />
                  {features.includes('macro') && (
                    <MacroShop
                      level={state.macro}
                      on={state.macroOn}
                      money={money}
                      stage={state.stage}
                      onBuy={() => dispatch({ type: 'buyMacro' })}
                      onToggle={(on) => dispatch({ type: 'setMacro', on })}
                    />
                  )}
                </div>
              }
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
            abilities={abilitySlots}
            onAbility={activateAbility}
            tutorial={tutorial === 'click' || tutorial === 'deliver' ? tutorial : null}
            macroRate={isRunning ? macroRate : 0}
          />
          {/* En Cladex el agente ya informa el estado: la terminal se oculta para dejar lugar al código */}
          {/* En el celular la terminal no entra: lo importante está en las notificaciones 🔔 */}
          {look.features.nav !== 'agent' && (
            <div className="hidden md:contents">
              <Terminal log={log} errors={errors} />
            </div>
          )}
          {look.features.nav === 'nano' && (
            <NanoBar views={views} fresh={dotViews} view={currentView} onChange={navigate} />
          )}
          {look.features.nav === 'agent' && (
            <AgentBar
              views={views}
              fresh={dotViews}
              view={currentView}
              onChange={navigate}
              hasContract={contract !== null}
              isComplete={isComplete}
              elapsed={contract ? contract.time - timeLeft : 0}
            />
          )}
        </main>
      </div>

      {ideChrome && <StatusBar line={Math.floor(code) + 1} timeLeft={contract ? timeLeft : null} isUrgent={isUrgent} />}

      {notice && <Toast notice={notice} onDismiss={dismissNotice} />}
      <AchievementToast unlocked={state.records.unlocked} />
      <PurchaseBurst purchases={purchasesOf(state)} />
      {state.profile.mascot && (
        <MascotWalker
          key={mascotSummon}
          mascot={state.profile.mascot}
          startNow={mascotSummon > 0}
          onPet={() => {
            dispatch({ type: 'pet' })
            playSfx('notify')
          }}
        />
      )}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {inboxOpen && <InboxPanel inbox={state.inbox} onClose={() => setInboxOpen(false)} />}
      {ipoOpen && <IpoScreen state={state} onContinue={() => setIpoOpen(false)} />}
      {state.challengeChoice && (
        <ChallengePicker
          done={state.records.challengesDone}
          company={state.company}
          onPick={(id, company) => {
            dispatch({ type: 'setCompany', company })
            dispatch({ type: 'setChallenge', id })
            if (id) playSfx('levelUp')
          }}
        />
      )}
      {state.cardOffer && (
        <CardPicker
          offer={state.cardOffer}
          owned={state.cards}
          first={state.cards.length === 0 && state.prestige.sales === 0}
          onPick={(index) => {
            dispatch({ type: 'pickCard', index })
            playSfx('levelUp')
          }}
        />
      )}
      {featureQueue.length > 0 && (
        <FeatureCard
          key={featureQueue[0]}
          id={featureQueue[0]}
          onView={navigate}
          onClose={() => setFeatureQueue((q) => q.slice(1))}
        />
      )}
      {import.meta.env.DEV && (
        <DevPanel
          state={state}
          onPatch={(patch) => dispatch({ type: 'dev', patch })}
          onStage={devStage}
          onMaxTrees={devMaxTrees}
          onEvent={devEvent}
          onMinigame={(game) => setMinigame({ game, playing: true })}
          onMascot={() => setMascotSummon((n) => n + 1)}
          onBug={() => setBug({ id: Date.now(), x: 10 + Math.random() * 70, y: 15 + Math.random() * 55 })}
          speed={devSpeed}
          onSpeed={setDevSpeed}
        />
      )}
    </div>
  )
}

export default App
