import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'

/**
 * Aviso de logro al estilo Steam: aparece abajo a la derecha, de a uno, 4 segundos cada uno.
 * Compara la lista de logros con la anterior; al cargar la partida no avisa los que ya tenías.
 */
function AchievementToast({ unlocked }: { unlocked: string[] }) {
  const seen = useRef(unlocked)
  const [queue, setQueue] = useState<string[]>([])

  useEffect(() => {
    const before = new Set(seen.current)
    seen.current = unlocked
    const fresh = unlocked.filter((id) => !before.has(id))
    // Si la lista se achicó (empezar de cero o importar), no hay nada que avisar
    if (fresh.length > 0 && unlocked.length > before.size) setQueue((q) => [...q, ...fresh])
  }, [unlocked])

  const current = ACHIEVEMENTS.find((a) => a.id === queue[0])
  useEffect(() => {
    if (!current) return
    const id = setTimeout(() => setQueue((q) => q.slice(1)), 4000)
    return () => clearTimeout(id)
  }, [current])

  if (!current) return null
  return (
    <div
      key={current.id}
      role="status"
      onClick={() => setQueue((q) => q.slice(1))}
      className="fixed right-3 bottom-40 left-3 z-50 flex md:bottom-10 md:left-auto md:w-72 animate-slide-in cursor-pointer items-center gap-3 rounded-xl border border-yellow/40 bg-panel-2 p-3 shadow-[0_14px_40px_rgba(0,0,0,.45)]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-yellow/15 text-2xl">{current.icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold tracking-wider text-yellow uppercase">🏆 Logro desbloqueado</span>
        <span className="block truncate font-extrabold">{current.name}</span>
        <span className="block truncate text-xs text-muted">{current.description} · +1 %</span>
      </span>
    </div>
  )
}

export default AchievementToast
