type SkillCardProps = {
  icon: string
  name: string
  effect: string
  level: number
  maxLevel: number
  /** Costo en XP del siguiente nivel */
  cost: number
  /** Lo que tenés para gastar (XP o tokens) */
  xp: number
  /** Moneda del costo; por defecto XP */
  currency?: string
  /** Si falta un requisito, el texto que lo explica ("Requiere JavaScript Nv.3") */
  locked?: string | null
  onBuy: () => void
}

/** Tarjeta de algo que se mejora con XP: habilidades y tecnologías */
function SkillCard({ icon, name, effect, level, maxLevel, cost, xp, currency = 'XP', locked, onBuy }: SkillCardProps) {
  const isMax = level >= maxLevel
  const canBuy = !isMax && !locked && xp >= cost

  let label = `${level === 0 ? 'Aprender' : 'Mejorar'} · ${cost} ${currency}`
  if (isMax) label = '✓ Nivel máximo'
  else if (locked) label = `🔒 ${locked}`

  return (
    <li className={`flex flex-col rounded-xl border border-line bg-panel-2 p-4 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">
            {icon} {name}
          </p>
          <p className="text-xs text-muted">{effect}</p>
        </div>
        <span className="shrink-0 font-mono text-sm text-muted">
          Nv. {level}/{maxLevel}
        </span>
      </div>

      <div className="mt-auto mb-3 flex gap-1 pt-2">
        {Array.from({ length: maxLevel }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < level ? 'bg-green' : 'bg-panel'}`} />
        ))}
      </div>

      <button
        type="button"
        onClick={onBuy}
        disabled={!canBuy}
        className="w-full cursor-pointer rounded-lg border border-purple/50 bg-purple/15 py-2 font-mono text-sm font-bold text-purple transition-colors hover:bg-purple/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
      >
        {label}
      </button>
    </li>
  )
}

export default SkillCard
