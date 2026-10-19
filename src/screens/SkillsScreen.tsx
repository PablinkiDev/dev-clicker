import type { ReactNode } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import SkillCard from '../components/SkillCard'
import { SKILLS, type SkillId, type SkillLevels } from '../data/skills'
import { TECHS, missingRequirements, type TechId, type TechLevels } from '../data/techs'
import { skillCost } from '../game/formulas'

type SkillsScreenProps = {
  skills: SkillLevels
  tech: TechLevels
  xp: number
  onBuy: (skill: SkillId) => void
  onLearn: (tech: TechId) => void
  /** Sección de herramientas (editores), que se paga con dinero */
  tools: ReactNode
}

const GRID = 'mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'

function SkillsScreen({ skills, tech, xp, onBuy, onLearn, tools }: SkillsScreenProps) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Las <b className="text-yellow">herramientas</b> se pagan con dinero; las <b className="text-purple">tecnologías</b> y{' '}
        <b className="text-purple">habilidades</b>, con XP.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">herramientas/</p>
      <div className="mb-5 max-w-sm">{tools}</div>

      <p className="mb-2.5 font-mono text-xs text-muted">tecnologías/</p>
      <ul className={GRID}>
        {TECHS.map((t) => (
          <SkillCard
            key={t.id}
            icon={t.icon}
            name={t.name}
            effect={t.effect}
            level={tech[t.id]}
            maxLevel={t.maxLevel}
            cost={skillCost(t.baseCost, tech[t.id])}
            xp={xp}
            locked={missingRequirements(t, tech) && `Requiere ${missingRequirements(t, tech)}`}
            onBuy={() => onLearn(t.id)}
          />
        ))}
      </ul>

      <p className="mb-2.5 font-mono text-xs text-muted">mejoras/personal/</p>
      <ul className={GRID}>
        {SKILLS.map((skill) => (
          <SkillCard
            key={skill.id}
            icon={skill.icon}
            name={skill.name}
            effect={skill.effect}
            level={skills[skill.id]}
            maxLevel={skill.maxLevel}
            cost={skillCost(skill.baseCost, skills[skill.id])}
            xp={xp}
            onBuy={() => onBuy(skill.id)}
          />
        ))}
      </ul>
    </section>
  )
}

export default SkillsScreen
