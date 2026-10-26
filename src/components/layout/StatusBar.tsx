import { formatTime } from '../../game/format'

type StatusBarProps = {
  line: number
  timeLeft: number | null
  isUrgent: boolean
  /** 🟧 Sublime (H5.8): "Line 12, Column 1", Tab Size y el lenguaje, como el de verdad */
  sublime?: boolean
  /** Lenguaje del contrato en curso (para Sublime) */
  lang?: string
}

/** Barra de estado inferior (solo escritorio). Se pone roja cuando el plazo está por vencer */
function StatusBar({ line, timeLeft, isUrgent, sublime = false, lang }: StatusBarProps) {
  if (sublime)
    return (
      <footer
        data-urgent={isUrgent}
        className={`status-bar hidden h-6 shrink-0 items-center font-mono text-[11px] transition-colors md:flex ${
          isUrgent ? 'bg-linear-to-r from-[#b4344a] to-[#8b2a5c] text-[#fff0f3]' : ''
        }`}
      >
        <span className="px-3">☰</span>
        <span className="px-2">Line {line}, Column 1</span>
        <span className="px-2">⏱ {timeLeft === null ? '—' : formatTime(timeLeft)}</span>
        <span className="flex-1" />
        <span className="px-3">Tab Size: 4</span>
        <span className="px-3">{lang ?? 'Plain Text'}</span>
      </footer>
    )
  return (
    <footer
      data-urgent={isUrgent}
      className={`status-bar hidden h-6.5 shrink-0 items-center font-mono text-xs text-[#eafff2] transition-colors md:flex ${
        isUrgent ? 'bg-linear-to-r from-[#b4344a] to-[#8b2a5c]' : 'bg-linear-to-r from-[#1f9d55] to-[#178a7a]'
      }`}
    >
      <span className="px-3">⎇ main</span>
      <span className="px-3">
        Ln <b>{line}</b>, Col 1
      </span>
      <span className="flex-1" />
      <span className="px-3">
        ⏱ <b>{timeLeft === null ? '—' : formatTime(timeLeft)}</b>
      </span>
      <span className="px-3">UTF-8</span>
      <span className="px-3">☕ café: lleno</span>
    </footer>
  )
}

export default StatusBar
