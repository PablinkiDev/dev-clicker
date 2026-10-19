import type { Skill } from '../data/skills'
import { skillCost } from '../game/formulas'

type SkillCardProps = {
  skill: Skill
  level: number
  xp: number
  onBuy: () => void
}

function SkillCard({ skill, level, xp, onBuy }: SkillCardProps) {
  const cost = skillCost(skill.baseCost, level)
  const isMax = level >= skill.maxLevel
  const canBuy = !isMax && xp >= cost

  return (
    <li className="flex flex-col rounded-xl border border-line bg-panel-2 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">
            {skill.icon} {skill.name}
          </p>
          <p className="text-xs text-muted">{skill.effect}</p>
        </div>
        <span className="shrink-0 font-mono text-sm text-muted">
          Nv. {level}/{skill.maxLevel}
        </span>
      </div>

      <div className="mt-auto mb-3 flex gap-1 pt-2">
        {Array.from({ length: skill.maxLevel }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < level ? 'bg-green' : 'bg-panel'}`} />
        ))}
      </div>

      <button
        type="button"
        onClick={onBuy}
        disabled={!canBuy}
        className="w-full cursor-pointer rounded-lg border border-purple/50 bg-purple/15 py-2 font-mono text-sm font-bold text-purple transition-colors hover:bg-purple/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
      >
        {isMax ? '✓ Nivel máximo' : `${level === 0 ? 'Aprender' : 'Mejorar'} · ${cost} XP`}
      </button>
    </li>
  )
}

export default SkillCard
