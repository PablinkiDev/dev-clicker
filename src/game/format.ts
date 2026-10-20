import type { Lang } from '../data/techs'

// Formatos de texto que se usan en varias partes de la interfaz

/** 75 → "1:15" */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** 2600 → "$2.600" */
export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-AR')}`
}

/** "boton-mas-grande" + css → "boton-mas-grande.css" */
export function fileName(id: string, lang: Lang = 'html'): string {
  return `${id}.${lang}`
}

/** 7.7 → "7,7" · 7 → "7" (como mucho un decimal) */
export function formatRate(amount: number): string {
  return amount.toLocaleString('es-AR', { maximumFractionDigits: 1 })
}
