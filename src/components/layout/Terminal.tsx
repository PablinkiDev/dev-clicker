import { useEffect, useRef } from 'react'
import type { LogEntry } from '../../game/reducer'

type TerminalProps = {
  log: LogEntry[]
  errors: number
}

const KIND_CLASS: Record<LogEntry['kind'], string> = {
  info: 'text-muted',
  success: 'text-green',
  error: 'text-red',
  crit: 'text-yellow',
}

/** Panel inferior: lo que va pasando en la partida, como la salida de una terminal */
function Terminal({ log, errors }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Siempre mostrar la última línea
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log])

  return (
    <section className="flex h-20 shrink-0 flex-col border-t border-line bg-panel md:h-37.5">
      <div className="hidden h-8 shrink-0 items-center gap-4.5 px-4.5 text-[11px] font-semibold tracking-wider text-faint uppercase md:flex">
        <span className="mt-1.75 border-b border-green pb-1.5 text-text">Terminal</span>
        <span>
          Problemas
          <span
            className={`ml-1 inline-grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] tracking-normal ${
              errors ? 'bg-red text-[#2b0710]' : 'bg-panel-3 text-muted'
            }`}
          >
            {errors}
          </span>
        </span>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 pt-1.5 pb-2.5 font-mono text-xs leading-5 md:px-4.5 md:pt-0.5">
        {log.map((entry) => (
          <p key={entry.id} className="truncate">
            <span className="text-green">➜ </span>
            <span className={KIND_CLASS[entry.kind]}>{entry.text}</span>
          </p>
        ))}
      </div>
    </section>
  )
}

export default Terminal
