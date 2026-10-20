import type { ReactNode } from 'react'
import { TECH_ICON } from '../ui'
import ScreenHeader from '../components/ScreenHeader'
import SkillCard from '../components/SkillCard'
import { STAGES } from '../data/stages'
import { SKILLS, type SkillId, type SkillLevels } from '../data/skills'
import { TECHS, missingRequirements, type TechId, type TechLevels } from '../data/techs'
import { skillCost } from '../game/formulas'
import { INVESTMENTS, investmentCost, type InvestmentId } from '../data/investments'
import type { Prestige } from '../game/prestige'

type SkillsScreenProps = {
  skills: SkillLevels
  tech: TechLevels
  /** Etapa de la empresa: algunas tecnologías piden una mínima */
  stage: number
  xp: number
  onBuy: (skill: SkillId) => void
  onLearn: (tech: TechId) => void
  /** Sección de herramientas (editores), que se paga con dinero */
  tools: ReactNode
  prestige: Prestige
  onInvest: (investment: InvestmentId) => void
}

const GRID = 'mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'

function SkillsScreen({ skills, tech, stage, xp, onBuy, onLearn, tools, prestige, onInvest }: SkillsScreenProps) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Las <b className="text-yellow">herramientas</b> se pagan con dinero; las{' '}
        <b className="text-purple">tecnologías</b> y <b className="text-purple">habilidades</b>, con XP.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">herramientas/</p>
      <div className="mb-5 max-w-sm">{tools}</div>

      <p className="mb-2.5 font-mono text-xs text-muted">tecnologías/</p>
      <ul className={GRID}>
        {TECHS.map((t) => (
          <SkillCard
            key={t.id}
            icon={TECH_ICON[t.id].icon}
            iconClass={TECH_ICON[t.id].className}
            name={t.name}
            effect={t.effect}
            level={tech[t.id]}
            maxLevel={t.maxLevel}
            cost={skillCost(t.baseCost, tech[t.id])}
            xp={xp}
            locked={missingRequirements(t, tech, stage) && `Requiere ${missingRequirements(t, tech, stage)}`}
            onBuy={() => onLearn(t.id)}
          />
        ))}
      </ul>

      {(['personal', 'company'] as const).map((group) => (
        <div key={group}>
          <p className="mb-2.5 font-mono text-xs text-muted">
            mejoras/{group === 'personal' ? 'personal' : 'empresa'}/
          </p>
          <ul className={GRID}>
            {SKILLS.filter((skill) => skill.group === group).map((skill) => {
              const minStage = skill.minStage ?? 0
              return (
                <SkillCard
                  key={skill.id}
                  icon={skill.icon}
                  name={skill.name}
                  effect={skill.effect}
                  level={skills[skill.id]}
                  maxLevel={skill.maxLevel}
                  cost={skillCost(skill.baseCost, skills[skill.id])}
                  xp={xp}
                  locked={stage < minStage ? `Requiere etapa ${STAGES[minStage].name}` : null}
                  onBuy={() => onBuy(skill.id)}
                />
              )
            })}
          </ul>
        </div>
      ))}

      {(prestige.sales > 0 || prestige.tokens > 0) && (
        <>
          <p className="mb-2.5 font-mono text-xs text-muted">
            mejoras/prestigio/ · <span className="text-purple">{prestige.tokens} tokens</span> · permanentes
          </p>
          <ul className={GRID}>
            {INVESTMENTS.map((inv) => {
              const required = inv.requires && INVESTMENTS.find((i) => i.id === inv.requires)
              const locked = required && prestige.investments[required.id] === 0 ? `Requiere ${required.name}` : null
              return (
                <SkillCard
                  key={inv.id}
                  icon={inv.icon}
                  name={`${inv.name} · ${inv.branch}`}
                  effect={inv.effect}
                  level={prestige.investments[inv.id]}
                  maxLevel={inv.maxLevel}
                  cost={investmentCost(prestige.investments[inv.id])}
                  xp={prestige.tokens}
                  currency={investmentCost(prestige.investments[inv.id]) === 1 ? 'token' : 'tokens'}
                  locked={locked}
                  onBuy={() => onInvest(inv.id)}
                />
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

export default SkillsScreen
