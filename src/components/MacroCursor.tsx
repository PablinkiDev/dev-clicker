// 🤖 Macro de teclado: un cursor que hace clic solo sobre Programar, al ritmo del macro.
import type { CSSProperties } from 'react'

type MacroCursorProps = {
  /** Clics por segundo del macro */
  rate: number
}

/** Puntero clásico de mouse */
function Pointer() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 drop-shadow-[0_2px_3px_rgba(0,0,0,.5)]" aria-hidden>
      <path
        d="M5 2 L5 19 L9.5 15 L12.5 21.5 L15.5 20 L12.5 13.7 L18.5 13.5 Z"
        fill="#fff"
        stroke="#111"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MacroCursor({ rate }: MacroCursorProps) {
  if (rate <= 0) return null
  // Con mucho ritmo, dos cursores turnándose (cada uno a la mitad de velocidad)
  const cursors = rate >= 3 ? 2 : 1
  const period = Math.min(1.5, Math.max(0.3, cursors / rate))
  return (
    <span className="pointer-events-none absolute inset-0" aria-label={`Macro: ${rate} clics por segundo`}>
      {Array.from({ length: cursors }, (_, i) => {
        const style = { '--tap': `${period}s`, animationDelay: `${(i * period) / cursors}s` } as CSSProperties
        return (
          <span key={i} className="absolute" style={{ right: `${14 + i * 12}%`, bottom: `${18 + i * 22}%` }}>
            {/* El "toque": un anillo que se expande cuando el cursor baja */}
            <span
              className="absolute -top-2 -left-2 size-5 animate-ripple rounded-full border-2 border-white/80"
              style={style}
            />
            <span className="block animate-tap" style={style}>
              <Pointer />
            </span>
          </span>
        )
      })}
      <span className="absolute right-2 bottom-1 font-mono text-[10px] font-bold opacity-70">
        🤖 {rate.toLocaleString('es-AR', { maximumFractionDigits: 1 })}/s
      </span>
    </span>
  )
}

export default MacroCursor
