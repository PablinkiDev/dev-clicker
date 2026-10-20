import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { snippetsFor } from '../../data/snippets'
import { fileName } from '../../game/format'
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

/** Cuántas líneas ya escritas se dibujan como máximo (las de más arriba no se ven igual) */
const VISIBLE_LINES = 80

/** Qué tan rápido la animación alcanza al código real: más alto = menos retraso */
const CATCH_UP_SPEED = 10

type CodeLineProps = {
  number: number
  text: string
  syntax: boolean
  lineNumbers: boolean
  /** Dígitos del número de línea más grande: define el ancho del margen */
  digits: number
  /** Línea que se está escribiendo: muestra el cursor */
  isCursor?: boolean
}

/**
 * Una línea del editor. memo: si sus props no cambian, React no la vuelve a dibujar.
 * Importa porque la animación redibuja el editor unas 60 veces por segundo.
 */
const CodeLine = memo(function CodeLine({
  number,
  text,
  syntax,
  lineNumbers,
  digits,
  isCursor = false,
}: CodeLineProps) {
  return (
    <div className={`code-line flex whitespace-pre ${isCursor ? 'is-cursor bg-blue/5' : ''}`}>
      {lineNumbers ? (
        <span
          className={`shrink-0 pr-4 pl-2 text-right select-none ${isCursor ? 'text-text' : 'text-faint'}`}
          style={{ width: `calc(${digits}ch + 1.5rem)` }}
        >
          {number}
        </span>
      ) : (
        <span className="w-4 shrink-0 md:w-5" />
      )}
      <span className="min-w-0 overflow-hidden text-ellipsis">
        {syntax ? highlight(text) : text}
        {isCursor && <span className="inline-block h-[18px] w-0.5 animate-pulse bg-text align-middle" />}
      </span>
    </div>
  )
})

/**
 * El editor. El código real llega a saltos (cada tick o cada clic), así que acá se anima
 * un valor "shown" que lo persigue suavemente: las líneas aparecen de a una y la línea
 * actual se va tipeando letra por letra.
 */
function CodeView({ contract, code, syntax, lineNumbers }: CodeViewProps) {
  const lines = snippetsFor(contract.id, contract.lang)
  const [shown, setShown] = useState(code)
  const shownRef = useRef(code)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Animación con requestAnimationFrame: corre solo mientras "shown" no alcanzó a "code"
  useEffect(() => {
    if (code < shownRef.current) {
      // El código bajó (contrato nuevo): sin animación
      shownRef.current = code
      setShown(code)
      return
    }
    let frame = 0
    let last = performance.now()
    function step(now: number) {
      // El primer frame puede traer una hora apenas anterior a performance.now(): dt nunca negativo
      const dt = Math.max(0, (now - last) / 1000)
      last = now
      // Persecución exponencial: avanza una fracción de lo que falta, siempre suave
      const next = shownRef.current + (code - shownRef.current) * (1 - Math.exp(-dt * CATCH_UP_SPEED))
      shownRef.current = code - next < 0.01 ? code : next
      setShown(shownRef.current)
      if (shownRef.current < code) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [code])

  const written = Math.floor(shown)
  // Como en un editor real: el margen se ensancha si el archivo tiene números de línea más largos
  const digits = Math.max(3, String(contract.code).length)
  const isComplete = written >= contract.code

  // Mantener el cursor a la vista. useLayoutEffect: antes de pintar, así no "tiembla"
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [written])

  const first = Math.max(0, written - VISIBLE_LINES)
  const rows = Array.from({ length: written - first }, (_, i) => first + i)

  // La línea actual se tipea según la parte decimal de "shown"
  const current = lines[written % lines.length] ?? ''
  const typed = current.slice(0, Math.floor((shown - written) * current.length))

  return (
    <div
      ref={scrollRef}
      data-file={fileName(contract.id, contract.lang)}
      className="code-view min-h-0 flex-1 overflow-y-auto py-2 font-mono text-[13px] leading-[22px] md:text-sm"
    >
      {rows.map((i) => (
        <CodeLine
          key={i}
          number={i + 1}
          text={lines[i % lines.length]}
          syntax={syntax}
          lineNumbers={lineNumbers}
          digits={digits}
        />
      ))}
      {!isComplete && (
        <CodeLine
          number={written + 1}
          text={typed}
          syntax={syntax}
          lineNumbers={lineNumbers}
          digits={digits}
          isCursor
        />
      )}
    </div>
  )
}

export default CodeView
