// ✨ H1: cuando un número sube (cobrar un contrato, ganar XP), aparece "+X" flotando y el número rebota.
import { useEffect, useState, type ReactNode } from 'react'

type GainPopProps = {
  value: number
  format: (n: number) => string
  /** Lo que se muestra (el número formateado, con su estilo) */
  children: ReactNode
  className?: string
}

/** Cuánto tiene que subir para celebrarlo (los centavos de los eventos no cuentan) */
const MIN_GAIN = 1

function GainPop({ value, format, children, className = '' }: GainPopProps) {
  const [previous, setPrevious] = useState(value)
  const [gains, setGains] = useState<{ id: number; amount: number }[]>([])

  // Se compara con el valor anterior mientras se dibuja (sin efectos): así no hay un render de más
  if (value !== previous) {
    setPrevious(value)
    if (value - previous >= MIN_GAIN) {
      setGains((g) => [...g.slice(-2), { id: (g.at(-1)?.id ?? 0) + 1, amount: value - previous }])
    }
  }

  // Cada "+X" se va solo
  useEffect(() => {
    if (gains.length === 0) return
    const id = setTimeout(() => setGains((g) => g.slice(1)), 1100)
    return () => clearTimeout(id)
  }, [gains])

  const last = gains.at(-1)
  return (
    <span className={`relative inline-flex ${className}`}>
      <span key={last?.id ?? 0} className={`inline-flex items-center gap-1.5 ${last ? 'animate-bump' : ''}`}>
        {children}
      </span>
      {gains.map((g) => (
        <span
          key={g.id}
          className="pointer-events-none absolute top-0 left-full ml-2 animate-gain font-mono text-sm font-extrabold whitespace-nowrap text-green"
        >
          +{format(g.amount)}
        </span>
      ))}
    </span>
  )
}

export default GainPop
