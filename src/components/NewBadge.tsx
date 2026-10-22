// 🆕 H4: la etiqueta "¡Nuevo!" de lo recién desbloqueado
function NewBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`animate-pop rounded-md bg-yellow px-1.5 py-px font-mono text-[9px] font-extrabold tracking-wide text-[#2b1a00] uppercase ${className}`}
    >
      ¡Nuevo!
    </span>
  )
}

export default NewBadge
