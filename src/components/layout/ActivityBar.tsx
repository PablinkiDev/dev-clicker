import type { ReactNode } from 'react'
import { VIEWS, VIEW_LABEL, type View } from '../../ui'

type ActivityBarProps = {
  view: View
  onChange: (view: View) => void
  /** Ofertas disponibles, para el globito */
  offersCount: number
  /** Mejoras que se pueden comprar ahora, para el globito */
  skillsAvailable: number
}

// Íconos en SVG con el estilo de VS Code (trazo, sin relleno)
const ICONS: Record<View, ReactNode> = {
  work: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  board: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14c2.3 0 4 1.5 4.5 4" />
    </>
  ),
  skills: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M6 8.5v7M8.3 7.2l7.4 3.8M8.3 16.8l7.4-3.8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
}

/** Barra de actividad: a la izquierda en escritorio, abajo en el celular */
function ActivityBar({ view, onChange, offersCount, skillsAvailable }: ActivityBarProps) {
  const badges: Partial<Record<View, number>> = { board: offersCount, skills: skillsAvailable }

  return (
    <nav className="order-last flex shrink-0 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:order-first md:w-13 md:flex-col md:border-t-0 md:border-r md:pt-1.5 md:pb-0">
      {VIEWS.map((v) => {
        const isActive = v === view
        const badge = badges[v]
        return (
          <button
            key={v}
            type="button"
            title={VIEW_LABEL[v]}
            onClick={() => onChange(v)}
            className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2 transition-colors md:h-12 md:flex-none md:py-0 ${
              isActive ? 'text-green md:text-text' : 'text-faint hover:text-text'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 right-1/4 left-1/4 h-0.5 rounded bg-green md:top-2.5 md:right-auto md:bottom-2.5 md:left-0 md:h-auto md:w-0.5" />
            )}
            <svg
              viewBox="0 0 24 24"
              className="size-5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[v]}
            </svg>
            <span className="text-[10px] font-semibold md:hidden">{VIEW_LABEL[v]}</span>
            {badge ? (
              <span className="absolute top-1.5 right-[calc(50%-20px)] grid h-4 min-w-4 place-items-center rounded-full bg-purple px-1 text-[10px] font-extrabold text-[#1b0f2b] md:top-2 md:right-2">
                {badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}

export default ActivityBar
