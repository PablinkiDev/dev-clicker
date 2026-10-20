import { useState, type ReactNode } from 'react'
import SkillTree, { type TreeEdge, type TreeNode } from '../components/SkillTree'
import { TECH_ICON } from '../ui'
import ScreenHeader from '../components/ScreenHeader'
import SkillCard from '../components/SkillCard'
import { STAGES } from '../data/stages'
import { SKILLS, type SkillId, type SkillLevels } from '../data/skills'
import { TECHS, missingRequirements, type Tech, type TechId, type TechLevels } from '../data/techs'
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

/** Dónde va cada tecnología en el árbol: columna y fila (puede ser media fila, para centrar) */
const TECH_LAYOUT: Record<TechId, { col: number; row: number }> = {
  html: { col: 0, row: 0 },
  css: { col: 0, row: 1 },
  javascript: { col: 1, row: 0.5 },
  git: { col: 1, row: 4.25 },
  typescript: { col: 2, row: 0 },
  react: { col: 2, row: 1 },
  node: { col: 2, row: 2 },
  python: { col: 2, row: 3.25 },
  java: { col: 2, row: 4.25 },
  ai: { col: 2, row: 5.5 },
  angular: { col: 3, row: 0 },
  nest: { col: 3, row: 1.25 },
  sql: { col: 3, row: 2.25 },
  mongo: { col: 3, row: 3.25 },
}

function SkillsScreen({ skills, tech, stage, xp, onBuy, onLearn, tools, prestige, onInvest }: SkillsScreenProps) {
  const lockedText = (t: Tech) => {
    const missing = missingRequirements(t, tech, stage)
    return missing && `Requiere ${missing}`
  }

  const techNodes: TreeNode[] = TECHS.map((t) => {
    const level = tech[t.id]
    const locked = missingRequirements(t, tech, stage) !== null
    return {
      id: t.id,
      ...TECH_LAYOUT[t.id],
      icon: TECH_ICON[t.id].icon,
      iconClass: TECH_ICON[t.id].className,
      name: t.name,
      level,
      maxLevel: t.maxLevel,
      locked,
      affordable: !locked && level < t.maxLevel && xp >= skillCost(t.baseCost, level),
    }
  })
  const techEdges: TreeEdge[] = TECHS.flatMap((t) =>
    t.requires.map(([from, level]) => ({ from, to: t.id, active: tech[from] >= level })),
  )

  // Nodo elegido: arranca en el primero que se puede comprar (o en JavaScript)
  const [selected, setSelected] = useState<TechId>(
    () => (techNodes.find((n) => n.affordable)?.id as TechId | undefined) ?? 'javascript',
  )
  const selectedTech = TECHS.find((t) => t.id === selected) ?? TECHS[0]

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Las <b className="text-yellow">herramientas</b> se pagan con dinero; las{' '}
        <b className="text-purple">tecnologías</b> y <b className="text-purple">habilidades</b>, con XP.
      </ScreenHeader>

      <p className="mb-2.5 font-mono text-xs text-muted">herramientas/</p>
      <div className="mb-5 max-w-sm">{tools}</div>

      <p className="mb-2.5 font-mono text-xs text-muted">tecnologías/</p>
      <SkillTree
        columns={['fundamentos/', 'base/', 'stack/', 'avanzado/']}
        nodes={techNodes}
        edges={techEdges}
        selected={selectedTech.id}
        onSelect={(id) => setSelected(id as TechId)}
      >
        <SkillCard
          icon={TECH_ICON[selectedTech.id].icon}
          iconClass={TECH_ICON[selectedTech.id].className}
          name={selectedTech.name}
          effect={selectedTech.effect}
          level={tech[selectedTech.id]}
          maxLevel={selectedTech.maxLevel}
          cost={skillCost(selectedTech.baseCost, tech[selectedTech.id])}
          xp={xp}
          locked={lockedText(selectedTech)}
          onBuy={() => onLearn(selectedTech.id)}
        />
      </SkillTree>

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
