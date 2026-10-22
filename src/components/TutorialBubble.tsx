// 🧭 C2: los globitos del tutorial. Señalan qué tocar en la primera partida y se van solos.
type TutorialBubbleProps = {
  text: string
  /** Hacia dónde apunta la flechita: el globo va arriba (apunta abajo) o abajo (apunta arriba) */
  pointing?: 'down' | 'up'
  /** Posición (clases absolute: top/left/right…) */
  className?: string
}

function TutorialBubble({ text, pointing = 'down', className = '' }: TutorialBubbleProps) {
  return (
    <span
      role="status"
      className={`pointer-events-none absolute z-30 w-max max-w-60 animate-bounce rounded-xl bg-cyan px-3 py-2 text-center text-xs font-extrabold text-[#06222b] shadow-xl ${className}`}
    >
      {text}
      <i
        className={`absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-cyan ${pointing === 'down' ? '-bottom-1' : '-top-1'}`}
      />
    </span>
  )
}

export default TutorialBubble
