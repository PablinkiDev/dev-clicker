// 💡 Simón dice del servidor: el servidor muestra una secuencia de luces y hay que repetirla.
import { useEffect, useRef, useState } from 'react'
import { SIMON_FLASH_MS, SIMON_LENGTHS, SIMON_SECONDS } from '../../data/minigames'
import { TimeBar, type GameProps } from './shared'
import { useCountdown } from './useCountdown'

const LIGHTS = [
  { name: 'Verde', on: 'bg-green shadow-[0_0_28px_#5af78e]', off: 'bg-green/15' },
  { name: 'Amarilla', on: 'bg-yellow shadow-[0_0_28px_#ffcb6b]', off: 'bg-yellow/15' },
  { name: 'Violeta', on: 'bg-purple shadow-[0_0_28px_#c792ea]', off: 'bg-purple/15' },
  { name: 'Celeste', on: 'bg-cyan shadow-[0_0_28px_#89ddff]', off: 'bg-cyan/15' },
]

/** Mostrando la secuencia, esperando que la repitas, o mostrando cómo te fue */
type Phase = 'show' | 'input' | 'ok' | 'fail'

function SimonGame({ onDone }: GameProps) {
  const [sequences] = useState(() =>
    SIMON_LENGTHS.map((length) => Array.from({ length }, () => Math.floor(Math.random() * LIGHTS.length))),
  )
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [phase, setPhase] = useState<Phase>('show')
  const [position, setPosition] = useState(0)
  const [lit, setLit] = useState<number | null>(null)
  const finished = useRef(false)
  const sequence = sequences[round]

  // Mostrar la secuencia: cada luz se prende un ratito, con una pausa entre una y otra
  useEffect(() => {
    if (phase !== 'show') return
    const step = SIMON_FLASH_MS + 200
    const timers = sequence.flatMap((light, i) => [
      setTimeout(() => setLit(light), 700 + i * step),
      setTimeout(() => setLit(null), 700 + i * step + SIMON_FLASH_MS),
    ])
    timers.push(setTimeout(() => setPhase('input'), 700 + sequence.length * step))
    return () => timers.forEach(clearTimeout)
  }, [phase, sequence])

  function end(ok: boolean) {
    const total = hits + (ok ? 1 : 0)
    setHits(total)
    setPhase(ok ? 'ok' : 'fail')
    setTimeout(() => {
      if (round === sequences.length - 1) {
        if (finished.current) return
        finished.current = true
        onDone(total)
      } else {
        setRound(round + 1)
        setPosition(0)
        setPhase('show')
      }
    }, 1000)
  }

  const left = useCountdown(SIMON_SECONDS, round, () => end(false), phase !== 'input')

  function press(light: number) {
    if (phase !== 'input') return
    setLit(light)
    setTimeout(() => setLit((l) => (l === light ? null : l)), 200)
    if (light !== sequence[position]) return end(false)
    if (position + 1 === sequence.length) end(true)
    else setPosition(position + 1)
  }

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Secuencia {round + 1}/3 ({sequence.length} luces) · bien {hits}
      </p>
      <TimeBar left={phase === 'input' ? left : SIMON_SECONDS} total={SIMON_SECONDS} />
      <div className="mx-auto max-w-xs rounded-2xl border-2 border-line-2 bg-panel p-4">
        <p className="mb-3 text-center font-mono text-[11px] tracking-widest text-faint">▮▮ SERVIDOR-01 ▮▮</p>
        <div className="grid grid-cols-2 gap-3">
          {LIGHTS.map((light, i) => (
            <button
              key={light.name}
              type="button"
              onPointerDown={() => press(i)}
              disabled={phase !== 'input'}
              aria-label={`Luz ${light.name}`}
              className={`aspect-square cursor-pointer rounded-full transition-all duration-100 disabled:cursor-default ${
                lit === i ? light.on : light.off
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 min-h-5 text-center text-xs">
        {phase === 'show' && <span className="text-muted">Mirá bien…</span>}
        {phase === 'input' && (
          <span className="text-cyan">
            Tu turno: {position}/{sequence.length}
          </span>
        )}
        {phase === 'ok' && <span className="text-green">✓ ¡Servidor reiniciado!</span>}
        {phase === 'fail' && <span className="text-red">✗ El servidor sigue colgado</span>}
      </p>
    </>
  )
}

export default SimonGame
