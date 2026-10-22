import { useEffect } from 'react'
import { playSfx } from '../audio/audio'
import { FEATURES } from '../data/features'
import type { View } from '../ui'

type FeatureCardProps = {
  /** Id de la funcionalidad recién revelada */
  id: string
  /** Ir a la pantalla de la funcionalidad */
  onView: (view: View) => void
  onClose: () => void
}

/** 🔓 Tarjeta que celebra una mecánica nueva y la explica en una línea (el mini tutorial) */
function FeatureCard({ id, onView, onClose }: FeatureCardProps) {
  const feature = FEATURES.find((f) => f.id === id)

  useEffect(() => {
    playSfx('achievement')
  }, [id])

  if (!feature) return null
  return (
    <div
      role="dialog"
      aria-label={`Nuevo: ${feature.name}`}
      className="fixed top-28 left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 animate-slide-down rounded-2xl border border-green/50 bg-panel-2 p-4 shadow-[0_14px_40px_rgba(0,0,0,.5)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-green/15 text-2xl">{feature.icon}</span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold tracking-wider text-green uppercase">🔓 ¡Nuevo!</p>
          <p className="text-lg leading-tight font-extrabold">{feature.name}</p>
          <p className="mt-1 text-sm text-muted">{feature.text}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {feature.view && (
          <button
            type="button"
            onClick={() => {
              onView(feature.view!)
              onClose()
            }}
            className="flex-1 cursor-pointer rounded-xl bg-green py-2 text-sm font-extrabold text-[#062312]"
          >
            Ver ahora
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className={`cursor-pointer rounded-xl border border-line-2 px-4 py-2 text-sm text-muted hover:text-text ${feature.view ? '' : 'flex-1'}`}
        >
          {feature.view ? 'Después' : '¡Entendido!'}
        </button>
      </div>
    </div>
  )
}

export default FeatureCard
