import { formatTime } from '../../game/format'

type StatusBarProps = {
  line: number
  timeLeft: number | null
  isUrgent: boolean
}

/** Barra de estado inferior (solo escritorio). Se pone roja cuando el plazo está por vencer */
function StatusBar({ line, timeLeft, isUrgent }: StatusBarProps) {
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
