import { useEffect, useEffectEvent, useRef, useState, type ComponentType } from 'react'
import {
  MERGE_CONFLICTS,
  MERGE_SECONDS,
  MINIGAMES,
  MINIGAME_INVITE_SECONDS,
  MINIGAME_REWARD_SECONDS,
  REVIEW_ROUNDS,
  REVIEW_SECONDS,
  TYPING_COMMANDS,
  TYPING_SECONDS,
  minigameReward,
  pickSome,
  type MinigameId,
} from '../data/minigames'
import CablesGame from './minigames/CablesGame'
import DeployGame from './minigames/DeployGame'
import MemoryGame from './minigames/MemoryGame'
import { TimeBar, type GameProps } from './minigames/shared'
import { useCountdown } from './minigames/useCountdown'
import SimonGame from './minigames/SimonGame'
import WhackGame from './minigames/WhackGame'

// --- Invitación ---------------------------------------------------------------------------

type InviteProps = { game: MinigameId; onPlay: () => void; onSkip: () => void }

/** La invitación: abajo a la derecha, como los eventos. Si no la tocás, se va sola */
export function MinigameInvite({ game, onPlay, onSkip }: InviteProps) {
  const info = MINIGAMES.find((m) => m.id === game)!
  const left = useCountdown(MINIGAME_INVITE_SECONDS, 0, onSkip)
  return (
    <div
      role="dialog"
      aria-label={info.title}
      className="absolute right-3 bottom-28 z-30 w-[min(22rem,calc(100%-1.5rem))] rounded-2xl border border-cyan/50 bg-panel-2 p-4 shadow-2xl md:right-5 md:bottom-32"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{info.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold tracking-wider text-cyan uppercase">
            Minijuego{info.forDevs && <span className="ml-1.5 text-purple normal-case">🧑‍💻 para programadores</span>}
          </p>
          <p className="leading-tight font-extrabold">{info.title}</p>
          <p className="mt-1 text-xs text-muted italic">{info.invite}</p>
        </div>
      </div>
      <p className="mt-2 text-xs">{info.rules}</p>
      <p className="mt-1 font-mono text-[11px] text-muted">
        Premio: equipo hasta ×3 por {MINIGAME_REWARD_SECONDS} s + XP
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onPlay}
          className="flex-1 cursor-pointer rounded-xl bg-cyan py-2 text-sm font-extrabold text-[#06222b]"
        >
          ▶ Jugar
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="cursor-pointer rounded-xl border border-line-2 px-3 text-xs text-muted hover:text-text"
        >
          Ahora no ({Math.ceil(left)})
        </button>
      </div>
    </div>
  )
}

// --- Los juegos -----------------------------------------------------------------------------

/** 🔍 Tocá la línea con el bug. 3 rondas, cada una más rápida */
function ReviewGame({ onDone }: GameProps) {
  const [rounds] = useState(() => pickSome(REVIEW_ROUNDS, 3))
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null) // línea elegida (-1 = se acabó el tiempo)
  const current = rounds[round]
  const left = useCountdown(REVIEW_SECONDS[round], round, () => setAnswer(-1), answer !== null)

  function next(hit: boolean) {
    const total = hits + (hit ? 1 : 0)
    setHits(total)
    if (round === rounds.length - 1) onDone(total)
    else {
      setRound(round + 1)
      setAnswer(null)
    }
  }

  // Después de responder, se muestra el porqué un ratito y sigue solo
  const pending = useEffectEvent(() => next(answer === current.bug))
  useEffect(() => {
    if (answer === null) return
    const id = setTimeout(pending, 1400)
    return () => clearTimeout(id)
  }, [answer])

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Ronda {round + 1}/3 · aciertos {hits}
      </p>
      <TimeBar left={answer === null ? left : 0} total={REVIEW_SECONDS[round]} />
      <ol className="overflow-hidden rounded-xl border border-line bg-panel font-mono text-[13px]">
        {current.lines.map((line, i) => {
          const reveal = answer !== null
          const style = !reveal
            ? 'hover:bg-cyan/10'
            : i === current.bug
              ? 'bg-green/15 text-green'
              : i === answer
                ? 'bg-red/15 text-red'
                : 'opacity-50'
          return (
            <li key={i}>
              <button
                type="button"
                disabled={reveal}
                onClick={() => setAnswer(i)}
                className={`flex w-full cursor-pointer gap-3 px-3 py-1.5 text-left whitespace-pre disabled:cursor-default ${style}`}
              >
                <span className="w-4 shrink-0 text-right text-faint">{i + 1}</span>
                {line}
              </button>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 min-h-5 text-xs">
        {answer === null ? (
          <span className="text-muted">¿Dónde está el bug?</span>
        ) : answer === current.bug ? (
          <span className="text-green">✓ ¡Bien visto! {current.why}</span>
        ) : (
          <span className="text-red">
            ✗ {answer === -1 ? 'Se acabó el tiempo.' : 'Esa no era.'} {current.why}
          </span>
        )}
      </p>
    </>
  )
}

/** 🔀 Leé el ticket y elegí la versión correcta. 3 conflictos con un solo reloj */
function MergeGame({ onDone }: GameProps) {
  const [conflicts] = useState(() => pickSome(MERGE_CONFLICTS, 3))
  const [index, setIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [picked, setPicked] = useState<'head' | 'feature' | null>(null)
  const current = conflicts[index]
  const finished = useRef(false)
  const finish = (total: number) => {
    if (finished.current) return
    finished.current = true
    onDone(total)
  }
  const left = useCountdown(MERGE_SECONDS, 0, () => finish(hits))

  function choose(side: 'head' | 'feature') {
    if (picked) return
    setPicked(side)
    const total = hits + (side === current.correct ? 1 : 0)
    setHits(total)
    setTimeout(() => {
      if (index === conflicts.length - 1) finish(total)
      else {
        setIndex(index + 1)
        setPicked(null)
      }
    }, 900)
  }

  const block = (side: 'head' | 'feature', lines: string[]) => {
    const reveal = picked !== null
    const style = !reveal
      ? 'border-line-2 hover:border-cyan/60 hover:bg-cyan/5'
      : side === current.correct
        ? 'border-green/60 bg-green/10'
        : side === picked
          ? 'border-red/60 bg-red/10'
          : 'border-line opacity-50'
    return (
      <button
        type="button"
        disabled={reveal}
        onClick={() => choose(side)}
        className={`w-full cursor-pointer rounded-xl border p-2.5 text-left font-mono text-[13px] disabled:cursor-default ${style}`}
      >
        <span className={`block text-[11px] font-bold ${side === 'head' ? 'text-cyan' : 'text-purple'}`}>
          {side === 'head' ? '<<<<<<< HEAD' : '>>>>>>> feature/nueva'}
        </span>
        {lines.map((l) => (
          <span key={l} className="block whitespace-pre-wrap">
            {l}
          </span>
        ))}
      </button>
    )
  }

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Conflicto {index + 1}/3 · resueltos bien {hits}
      </p>
      <TimeBar left={left} total={MERGE_SECONDS} />
      <p className="mb-2 rounded-lg bg-yellow/10 px-3 py-2 text-sm">
        🎫 <b>Ticket:</b> {current.ticket}
      </p>
      <div className="flex flex-col gap-2">
        {block('head', current.head)}
        {block('feature', current.feature)}
      </div>
    </>
  )
}

/** ⌨️ Escribí 3 comandos exactos antes de que se acabe el tiempo */
function TypingGame({ onDone }: GameProps) {
  const [commands] = useState(() => pickSome(TYPING_COMMANDS, 3))
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const finished = useRef(false)
  const finish = (total: number) => {
    if (finished.current) return
    finished.current = true
    onDone(total)
  }
  const left = useCountdown(TYPING_SECONDS, 0, () => finish(index))
  const target = commands[index]
  const ok = target.startsWith(text)

  function change(value: string) {
    if (value !== target) return setText(value)
    setText('')
    if (index === commands.length - 1) finish(commands.length)
    else setIndex(index + 1)
  }

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">Comando {index + 1}/3</p>
      <TimeBar left={left} total={TYPING_SECONDS} />
      <p className="mb-2 rounded-xl border border-line bg-panel px-3 py-2.5 font-mono text-[15px]">
        <span className="text-green">$ </span>
        <span className="text-text">{target.slice(0, ok ? text.length : 0)}</span>
        <span className="text-faint">{target.slice(ok ? text.length : 0)}</span>
      </p>
      <input
        autoFocus
        value={text}
        onChange={(e) => change(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-label="Escribí el comando"
        className={`w-full rounded-xl border bg-panel px-3 py-2.5 font-mono text-[15px] outline-none ${
          ok ? 'border-cyan/60' : 'border-red text-red'
        }`}
      />
      <p className="mt-2 text-xs text-muted">{ok ? 'Exacto, letra por letra.' : 'Hay un error de tipeo: borrá.'}</p>
    </>
  )
}

/** Qué componente juega cada minijuego */
const GAMES: Record<MinigameId, ComponentType<GameProps>> = {
  review: ReviewGame,
  merge: MergeGame,
  typing: TypingGame,
  whack: WhackGame,
  cables: CablesGame,
  deploy: DeployGame,
  memory: MemoryGame,
  simon: SimonGame,
}

// --- Ventana del minijuego ----------------------------------------------------------------

type MinigameModalProps = {
  game: MinigameId
  /** Al terminar: puntaje de 0 a 1 */
  onFinish: (score: number) => void
  onClose: () => void
}

export function MinigameModal({ game, onFinish, onClose }: MinigameModalProps) {
  const info = MINIGAMES.find((m) => m.id === game)!
  const [hits, setHits] = useState<number | null>(null)

  function done(total: number) {
    setHits(total)
    onFinish(total / 3)
  }

  const reward = hits === null ? null : minigameReward(hits / 3)
  const Game = GAMES[game]

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-bg/70 p-3 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label={info.title}
        className="w-full max-w-lg rounded-2xl border border-cyan/50 bg-panel-2 p-4 shadow-2xl"
      >
        <p className="mb-3 flex items-center gap-2 font-extrabold">
          <span className="text-2xl">{info.icon}</span> {info.title}
        </p>
        {hits === null ? (
          <Game onDone={done} />
        ) : (
          <div className="text-center">
            <p className="text-4xl">{hits === 3 ? '🏆' : hits > 0 ? '👍' : '😅'}</p>
            <p className="mt-1 text-lg font-extrabold">
              {hits === 3 ? '¡Perfecto! LGTM' : hits > 0 ? `${hits} de 3` : 'Esta vez no salió'}
            </p>
            <p className="mt-1 font-mono text-sm text-muted">
              {reward
                ? `Equipo ×${reward.mult.toLocaleString('es-AR')} por ${MINIGAME_REWARD_SECONDS} s + XP`
                : 'Sin premio, pero tampoco castigo.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full cursor-pointer rounded-xl bg-cyan py-2 text-sm font-extrabold text-[#06222b]"
            >
              Volver al trabajo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
