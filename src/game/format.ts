import { LANG_EXT, type Lang } from '../data/techs'

// Formatos de texto que se usan en varias partes de la interfaz

/** 75 → "1:15" */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Sufijos para números grandes: millón, billón (mil millones, como en los juegos), trillón… */
const SUFFIXES: [number, string][] = [
  [1e18, 'Qi'],
  [1e15, 'Qa'],
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
]

/**
 * Números enteros legibles: hasta 999.999 completos; después abreviados con un decimal.
 * 2600 → "2.600" · 40882080 → "40,9 M" · 4.1e13 → "41 T". Más allá de los Qi, notación científica.
 */
export function formatNumber(amount: number): string {
  const n = Math.round(amount)
  if (Math.abs(n) < 1e6) return n.toLocaleString('es-AR')
  if (Math.abs(n) >= 1e21) return n.toExponential(2).replace('.', ',')
  const [base, suffix] = SUFFIXES.find(([b]) => Math.abs(n) >= b)!
  const value = n / base
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: value < 100 ? 1 : 0 })} ${suffix}`
}

/** 2600 → "$2.600" · 40882080 → "$40,9 M" */
export function formatMoney(amount: number): string {
  return `$${formatNumber(amount)}`
}

/** "boton-mas-grande" + css → "boton-mas-grande.css" */
export function fileName(id: string, lang: Lang = 'html'): string {
  return `${id}.${LANG_EXT[lang]}`
}

/** 7.7 → "7,7" · 7 → "7" (como mucho un decimal) */
export function formatRate(amount: number): string {
  return amount < 1e6 ? amount.toLocaleString('es-AR', { maximumFractionDigits: 1 }) : formatNumber(amount)
}

/** 45 → "45 s" · 754 → "12 min" · 8100 → "2 h 15 min" */
export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds)
  if (s < 60) return `${s} s`
  const minutes = Math.floor(s / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`
}
