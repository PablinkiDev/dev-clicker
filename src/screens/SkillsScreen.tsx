import ScreenHeader from '../components/ScreenHeader'
import SkillCard from '../components/SkillCard'
import { SKILLS, type SkillId, type SkillLevels } from '../data/skills'

type SkillsScreenProps = {
  skills: SkillLevels
  xp: number
  onBuy: (skill: SkillId) => void
}

function SkillsScreen({ skills, xp, onBuy }: SkillsScreenProps) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Gastá <b className="text-purple">XP</b> en habilidades. Cada nivel cuesta un poco más que el anterior.
      </ScreenHeader>

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
