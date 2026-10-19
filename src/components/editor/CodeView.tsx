import { useEffect, useRef } from 'react'
import { snippetsFor } from '../../data/snippets'
import type { Contract } from '../../game/types'
import { highlight } from './highlight'

type CodeViewProps = {
  contract: Contract
  code: number
  /** Colores en el código (Notepad en adelante) */
  syntax: boolean
  /** Números de línea */
  lineNumbers: boolean
}

/** El editor: muestra una línea de código por cada línea escrita del contrato */
function CodeView({ contract, code, syntax, lineNumbers }: CodeViewProps) {
  const lines = snippetsFor(contract.id, contract.lang)
  const written = Math.floor(code)
  const isComplete = written >= contract.code
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cada vez que se escribe una línea, bajamos hasta el cursor (efecto sobre el DOM)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [written])

  // Líneas escritas + la línea actual con el cursor (si todavía falta código)
  const rows = Array.from({ length: isComplete ? written : written + 1 }, (_, i) => i)

  return (
    <div
      ref={scrollRef}
      className="code-view min-h-0 flex-1 overflow-y-auto py-2 font-mono text-[13px] leading-[22px] md:text-sm"
    >
      {rows.map((i) => {
        const isCursor = i === written
        return (
          <div key={i} className={`flex whitespace-pre ${isCursor ? 'bg-blue/5' : ''}`}>
            {lineNumbers ? (
              <span
                className={`w-10 shrink-0 pr-4 text-right select-none md:w-14 ${isCursor ? 'text-text' : 'text-faint'}`}
              >
                {i + 1}
              </span>
            ) : (
              <span className="w-4 shrink-0 md:w-5" />
            )}
            <span className="min-w-0 overflow-hidden text-ellipsis">
              {!isCursor && (syntax ? highlight(lines[i % lines.length]) : lines[i % lines.length])}
              {isCursor && <span className="inline-block h-[18px] w-0.5 animate-pulse bg-text align-middle" />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default CodeView
