// ✨ H1: cada compra hace un estallido de chispas donde tocaste.
import { useEffect, useState, type CSSProperties } from 'react'

type PurchaseBurstProps = {
  /** Cuántas cosas compraste en total: cuando sube, hay estallido */
  purchases: number
}

const PARTICLES = ['✨', '⭐', '✨', '💫', '✨', '⭐']

function PurchaseBurst({ purchases }: PurchaseBurstProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [previous, setPrevious] = useState(purchases)
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([])

  // Dónde fue el último toque (la compra se hace con ese toque)
  useEffect(() => {
    const onDown = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY })
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  if (purchases !== previous) {
    setPrevious(purchases)
    // Solo si subió y fue con un toque (no al cargar una partida ni con el teclado)
    if (purchases > previous && (pointer.x > 0 || pointer.y > 0)) {
      setBursts((b) => [...b.slice(-3), { id: (b.at(-1)?.id ?? 0) + 1, ...pointer }])
    }
  }

  useEffect(() => {
    if (bursts.length === 0) return
    const id = setTimeout(() => setBursts((b) => b.slice(1)), 650)
    return () => clearTimeout(id)
  }, [bursts])

  return (
    <>
      {bursts.map((b) => (
        <span key={b.id} className="pointer-events-none fixed z-80" style={{ left: b.x, top: b.y }} aria-hidden>
          {PARTICLES.map((p, i) => {
            const angle = (i / PARTICLES.length) * Math.PI * 2 - Math.PI / 2
            return (
              <span
                key={i}
                className="absolute animate-burst text-base"
                style={{ '--dx': `${Math.cos(angle) * 42}px`, '--dy': `${Math.sin(angle) * 42}px` } as CSSProperties}
              >
                {p}
              </span>
            )
          })}
        </span>
      ))}
    </>
  )
}

export default PurchaseBurst
