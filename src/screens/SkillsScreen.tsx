import type { ReactNode } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import SkillCard from '../components/SkillCard'
import { SKILLS, type SkillId, type SkillLevels } from '../data/skills'

type SkillsScreenProps = {
  skills: SkillLevels
  xp: number
  onBuy: (skill: SkillId) => void
  /** Sección de herramientas (editores), que se paga con dinero */
  tools: ReactNode
}

function SkillsScreen({ skills, xp, onBuy, tools }: SkillsScreenProps) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Las <b className="text-yellow">herramientas</b> se pagan con dinero; las <b className="text-purple">habilidades</b>, con XP.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">herramientas/</p>
      <div className="mb-5 max-w-sm">{tools}</div>

      <p className="mb-2.5 font-mono text-xs text-muted">mejoras/personal/</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {SKILLS.map((skill) => (
          <SkillCard key={skill.id} skill={skill} level={skills[skill.id]} xp={xp} onBuy={() => onBuy(skill.id)} />
        ))}
      </ul>
    </section>
  )
}

export default SkillsScreen
