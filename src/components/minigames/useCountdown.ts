// Reloj de los minijuegos.
import { useEffect, useEffectEvent, useState } from 'react'

/** Cuenta regresiva en décimas: llama a onEnd al llegar a 0. Cambiar `run` la reinicia */
export function useCountdown(seconds: number, run: number, onEnd: () => void, paused = false): number {
  // Se guarda junto con la ronda: si la ronda cambió, todavía no corrió y quedan los segundos completos
  const key = `${seconds}-${run}`
  const [tick, setTick] = useState({ key, left: seconds })
  const end = useEffectEvent(onEnd)
  useEffect(() => {
    if (paused) return
    const deadline = Date.now() + seconds * 1000
    const id = setInterval(() => {
      const left = Math.max(0, (deadline - Date.now()) / 1000)
      setTick({ key, left })
      if (left === 0) {
        clearInterval(id)
        end()
      }
    }, 100)
    return () => clearInterval(id)
  }, [seconds, key, paused])
  return tick.key === key ? tick.left : seconds
}
