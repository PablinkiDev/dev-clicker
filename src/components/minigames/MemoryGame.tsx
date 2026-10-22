// 🧠 Memoria de logos: encontrar los pares. Cuantos menos errores, más aciertos.
import { useRef, useState } from 'react'
import { MEMORY_LOGOS, MEMORY_MISSES, MEMORY_PAIRS, MEMORY_SECONDS, pickSome } from '../../data/minigames'
import { TimeBar, type GameProps } from './shared'
import { useCountdown } from './useCountdown'

type Card = { uid: number; icon: string; name: string }

/** Aciertos (de 3): con todos los pares, según los errores; si se acabó el tiempo, 1 con al menos la mitad */
function score(found: number, misses: number): number {
  if (found < MEMORY_PAIRS) return found >= MEMORY_PAIRS / 2 ? 1 : 0
  return misses <= MEMORY_MISSES[0] ? 3 : misses <= MEMORY_MISSES[1] ? 2 : 1
}

function MemoryGame({ onDone }: GameProps) {
  const [cards] = useState<Card[]>(() => {
    const logos = pickSome(MEMORY_LOGOS, MEMORY_PAIRS)
    return pickSome([...logos, ...logos], MEMORY_PAIRS * 2).map((logo, uid) => ({ ...logo, uid }))
  })
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const finished = useRef(false)
  const finish = (total: number) => {
    if (finished.current) return
    finished.current = true
    onDone(total)
  }
  const left = useCountdown(MEMORY_SECONDS, 0, () => finish(score(matched.length, misses)))

  function flip(index: number) {
    const card = cards[index]
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(card.icon)) return
    if (flipped.length === 0) return setFlipped([index])
    const first = cards[flipped[0]]
    if (first.icon === card.icon) {
      const now = [...matched, card.icon]
      setMatched(now)
      setFlipped([])
      if (now.length === MEMORY_PAIRS) setTimeout(() => finish(score(now.length, misses)), 500)
    } else {
      setFlipped([flipped[0], index])
      setMisses(misses + 1)
      setTimeout(() => setFlipped([]), 750)
    }
  }

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Pares {matched.length}/{MEMORY_PAIRS} · errores {misses}
      </p>
      <TimeBar left={left} total={MEMORY_SECONDS} />
      <div className="mx-auto grid max-w-sm grid-cols-4 gap-2">
        {cards.map((card, i) => {
          const isMatched = matched.includes(card.icon)
          const up = isMatched || flipped.includes(i)
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => flip(i)}
              aria-label={up ? card.name : 'Carta boca abajo'}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 select-none ${
                isMatched
                  ? 'border-green/60 bg-green/10'
                  : up
                    ? 'animate-pop border-cyan/60 bg-panel-3'
                    : 'border-line-2 bg-linear-to-br from-panel-3 to-panel hover:border-cyan/50'
              }`}
            >
              {up ? (
                <>
                  <span className="text-3xl leading-none">{card.icon}</span>
                  <span className="mt-1 font-mono text-[10px] text-muted">{card.name}</span>
                </>
              ) : (
                <span className="font-mono text-lg text-faint">{'</>'}</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Con todos los pares: hasta {MEMORY_MISSES[0]} errores ⭐⭐⭐ · hasta {MEMORY_MISSES[1]} ⭐⭐
      </p>
    </>
  )
}

export default MemoryGame
