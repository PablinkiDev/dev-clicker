// 🐛 Aplastá bugs: un topo. Los bugs asoman del código y hay que tocarlos antes de que se escondan.
import { useEffect, useState } from 'react'
import { WHACK_DUCK_CHANCE, WHACK_GOALS, WHACK_SECONDS, WHACK_SPAWN_MS, WHACK_VISIBLE_MS } from '../../data/minigames'
import { TimeBar, type GameProps } from './shared'
import { useCountdown } from './useCountdown'

/** Lo que hay en un agujero: un bug, el patito o el "splat" de un bug aplastado */
type Hole = { kind: 'bug' | 'duck' | 'splat'; until: number } | null

const HOLES = 9

function WhackGame({ onDone }: GameProps) {
  const [holes, setHoles] = useState<Hole[]>(() => Array(HOLES).fill(null))
  const [squashed, setSquashed] = useState(0)
  const [duckHit, setDuckHit] = useState(false)
  const left = useCountdown(WHACK_SECONDS, 0, () => onDone(WHACK_GOALS.filter((g) => squashed >= g).length))

  // Cada 100 ms: se esconden los que ya estuvieron mucho y, cada tanto, asoma uno nuevo (cada vez más seguido)
  useEffect(() => {
    const start = Date.now()
    let lastSpawn = 0
    const id = setInterval(() => {
      const now = Date.now()
      const progress = Math.min(1, (now - start) / (WHACK_SECONDS * 1000))
      const spawn = now - lastSpawn >= WHACK_SPAWN_MS * (1 - 0.5 * progress)
      if (spawn) lastSpawn = now
      setHoles((current) => {
        const next = current.map((h) => (h && h.until > now ? h : null))
        const free = next.flatMap((h, i) => (h ? [] : [i]))
        if (spawn && free.length > 0) {
          const index = free[Math.floor(Math.random() * free.length)]
          next[index] = {
            kind: Math.random() < WHACK_DUCK_CHANCE ? 'duck' : 'bug',
            until: now + WHACK_VISIBLE_MS * (1 - 0.35 * progress),
          }
        }
        return next
      })
    }, 100)
    return () => clearInterval(id)
  }, [])

  function hit(index: number) {
    const hole = holes[index]
    if (!hole || hole.kind === 'splat') return
    if (hole.kind === 'bug') setSquashed((n) => n + 1)
    else {
      // El patito te ayuda a pensar: aplastarlo cuesta 2 bugs
      setSquashed((n) => Math.max(0, n - 2))
      setDuckHit(true)
    }
    setHoles((current) => current.map((h, i) => (i === index ? { kind: 'splat', until: Date.now() + 300 } : h)))
  }

  const goal = WHACK_GOALS.find((g) => squashed < g)
  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Aplastados <b className="text-text">{squashed}</b>
        {goal ? ` · próxima meta ${goal}` : ' · ¡todas las metas!'}
      </p>
      <TimeBar left={left} total={WHACK_SECONDS} />
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
        {holes.map((hole, i) => (
          <button
            key={i}
            type="button"
            onPointerDown={() => hit(i)}
            aria-label={hole?.kind === 'bug' ? 'Bug' : hole?.kind === 'duck' ? 'Patito' : 'Vacío'}
            className="grid aspect-square cursor-pointer place-items-center rounded-full border-2 border-line-2 bg-panel text-4xl select-none"
          >
            {hole?.kind === 'bug' && <span className="animate-pop">🐛</span>}
            {hole?.kind === 'duck' && <span className="animate-pop">🦆</span>}
            {hole?.kind === 'splat' && <span>💥</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-5 text-center text-xs">
        {duckHit ? (
          <span className="text-red">🦆 ¡Al patito no! −2 bugs</span>
        ) : (
          <span className="text-muted">Metas: {WHACK_GOALS.join(' · ')} bugs</span>
        )}
      </p>
    </>
  )
}

export default WhackGame
