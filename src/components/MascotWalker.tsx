// 🐈 La mascota de la oficina (G4): cada tanto cruza la pantalla. Si la tocás, la acariciás.
import { useEffect, useState } from 'react'
import { MASCOTS, MASCOT_WALK_SECONDS, nextMascotWalk, type MascotId } from '../data/personalization'

type MascotWalkerProps = {
  mascot: MascotId
  onPet: () => void
  /** Sale a pasear apenas aparece (para el panel de dev) */
  startNow?: boolean
}

function MascotWalker({ mascot, onPet, startNow = false }: MascotWalkerProps) {
  /** El paseo actual (su id cambia en cada paseo para reiniciar la animación) o null si está durmiendo */
  const [walk, setWalk] = useState<number | null>(() => (startNow ? Date.now() : null))
  const [hearts, setHearts] = useState<number[]>([])
  const icon = MASCOTS.find((m) => m.id === mascot)?.icon ?? '🐈'

  // Espera un rato y sale a pasear; al terminar el paseo, vuelve a esperar
  useEffect(() => {
    if (walk !== null) {
      const id = setTimeout(() => setWalk(null), MASCOT_WALK_SECONDS * 1000 + 200)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setWalk(Date.now()), nextMascotWalk())
    return () => clearTimeout(id)
  }, [walk])

  if (walk === null) return null

  function pet() {
    onPet()
    const heart = Date.now()
    setHearts((h) => [...h, heart])
    setTimeout(() => setHearts((h) => h.filter((x) => x !== heart)), 700)
  }

  return (
    <div key={walk} className="pointer-events-none fixed bottom-24 left-0 z-20 animate-walk md:bottom-28">
      <button
        type="button"
        onClick={pet}
        aria-label="Acariciar a la mascota"
        className="pointer-events-auto relative block cursor-pointer text-4xl select-none"
      >
        <span className="block animate-bob">{icon}</span>
        {hearts.map((h) => (
          <span key={h} className="absolute -top-4 left-2 animate-float-up text-xl">
            ❤️
          </span>
        ))}
      </button>
    </div>
  )
}

export default MascotWalker
