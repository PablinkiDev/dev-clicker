import { formatNumber } from '../game/format'
import { useState, type ReactNode } from 'react'
import SkillTree, { type TreeEdge, type TreeNode } from '../components/SkillTree'
import { TECH_ICON } from '../ui'
import ScreenHeader from '../components/ScreenHeader'
import { SKILLS, missingSkillRequirements, type Skill, type SkillId, type SkillLevels } from '../data/skills'
import { TECHS, missingRequirements, type TechId, type TechLevels } from '../data/techs'
import { skillCost } from '../game/formulas'
import { INVESTMENTS, investmentCost, type InvestmentId } from '../data/investments'
import { FOUNDER_BONUS, founderBonus, type Prestige } from '../game/prestige'

type SkillsScreenProps = {
  /** 🔓 Funcionalidades reveladas: las pestañas que todavía no tocan no se muestran */
  features: string[]
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

/** Habilidades: las de base a la izquierda y las que dependen de ellas a la derecha */
const SKILL_LAYOUT: Record<SkillId, { col: number; row: number }> = {
  // Cada rama en su fila: escritura → atajos → memoria · crítico → devastador ·
  // concentración → halcón → flow · lógica → tiempo → negociador → suerte
  fastTyping: { col: 0, row: 0.5 },
  logicalThinking: { col: 0, row: 3 },
  criticalCode: { col: 1, row: 0 },
  shortcuts: { col: 1, row: 1 },
  focus: { col: 1, row: 2 },
  timeManagement: { col: 1, row: 3 },
  devastatingCrit: { col: 2, row: 0 },
  muscleMemory: { col: 2, row: 1 },
  hawkEye: { col: 2, row: 2 },
  negotiator: { col: 2, row: 3 },
  flowState: { col: 3, row: 2 },
  lucky: { col: 3, row: 3 },
  // Habilidades activas (F2), abajo de todo
  hackathon: { col: 2, row: 4 },
  doubleCoffee: { col: 2, row: 5 },
  crunch: { col: 3, row: 4 },
  pairProgramming: { col: 3, row: 5 },
  teamwork: { col: 0, row: 0.5 },
  knowledge: { col: 0, row: 2 },
  marketing: { col: 0, row: 3 },
  autoDeliver: { col: 1, row: 0 },
  kubernetes: { col: 1, row: 1 },
  codeReview: { col: 1, row: 2 },
  headhunter: { col: 1, row: 3 },
  autoAccept: { col: 2, row: 0 },
  homeOffice: { col: 2, row: 1 },
  investors: { col: 2, row: 3 },
}

/** Prestigio: una fila por rama (Productividad, Rentabilidad, Innovación) */
const INVESTMENT_LAYOUT: Record<InvestmentId, { col: number; row: number }> = {
  legacyCode: { col: 0, row: 0 },
  seniorTeam: { col: 1, row: 0 },
  premiumContracts: { col: 0, row: 1 },
  fastLearning: { col: 1, row: 1 },
  seedCapital: { col: 0, row: 2 },
  firstContacts: { col: 1, row: 2 },
  portfolio: { col: 0, row: 3 },
  license: { col: 1, row: 3 },
  cofounder: { col: 0, row: 4 },
  processes: { col: 1, row: 4 },
}

/** Pestañas de la pantalla: una por árbol */
type Tab = 'tools' | 'tech' | 'personal' | 'company' | 'prestige'

function SkillsScreen({
  features,
  skills,
  tech,
  stage,
  xp,
  onBuy,
  onLearn,
  tools,
  prestige,
  onInvest,
}: SkillsScreenProps) {
  const [tab, setTab] = useState<Tab>('tech')
  const xpCost = (cost: number) => `${formatNumber(cost)} XP`
  const requires = (missing: string | null) => missing && `Requiere ${missing}`

  // --- Tecnologías ---
  const techNodes: TreeNode[] = TECHS.map((t) => {
    const level = tech[t.id]
    const cost = skillCost(t.baseCost, level, t.minStage)
    const missing = missingRequirements(t, tech, stage)
    return {
      id: t.id,
      ...TECH_LAYOUT[t.id],
      icon: TECH_ICON[t.id].icon,
      iconClass: TECH_ICON[t.id].className,
      name: t.name,
      effect: t.effect,
      level,
      maxLevel: t.maxLevel,
      cost: xpCost(cost),
      missing: requires(missing),
      affordable: !missing && level < t.maxLevel && xp >= cost,
    }
  })
  const techEdges: TreeEdge[] = TECHS.flatMap((t) =>
    t.requires.map(([from, level]) => ({ from, to: t.id, active: tech[from] >= level })),
  )

  // --- Habilidades personales y de empresa ---
  const skillNodes = (group: Skill['group']): TreeNode[] =>
    SKILLS.filter((sk) => sk.group === group).map((sk) => {
      const level = skills[sk.id]
      const cost = skillCost(sk.baseCost, level, sk.minStage)
      const missing = missingSkillRequirements(sk, skills, stage)
      return {
        id: sk.id,
        ...SKILL_LAYOUT[sk.id],
        icon: sk.icon,
        name: sk.name,
        effect: sk.effect,
        level,
        maxLevel: sk.maxLevel,
        cost: xpCost(cost),
        missing: requires(missing),
        affordable: !missing && level < sk.maxLevel && xp >= cost,
      }
    })
  const skillEdges = (group: Skill['group']): TreeEdge[] =>
    SKILLS.filter((sk) => sk.group === group).flatMap((sk) =>
      (sk.requires ?? []).map(([from, level]) => ({ from, to: sk.id, active: skills[from] >= level })),
    )
  const personalNodes = skillNodes('personal')
  const companyNodes = skillNodes('company')

  // --- Prestigio ---
  const investmentNodes: TreeNode[] = INVESTMENTS.map((inv) => {
    const level = prestige.investments[inv.id]
    const cost = investmentCost(inv, level)
    const required = inv.requires && INVESTMENTS.find((i) => i.id === inv.requires)
    const missing = required && prestige.investments[required.id] === 0 ? `Requiere ${required.name}` : null
    return {
      id: inv.id,
      ...INVESTMENT_LAYOUT[inv.id],
      icon: inv.icon,
      name: inv.name,
      effect: `${inv.branch} · ${inv.effect}`,
      level,
      maxLevel: inv.maxLevel,
      cost: `${cost} ${cost === 1 ? 'token' : 'tokens'}`,
      missing,
      affordable: !missing && level < inv.maxLevel && prestige.tokens >= cost,
    }
  })
  const investmentEdges: TreeEdge[] = INVESTMENTS.filter((inv) => inv.requires).map((inv) => ({
    from: inv.requires as InvestmentId,
    to: inv.id,
    active: prestige.investments[inv.requires as InvestmentId] > 0,
  }))

  const available = (nodes: TreeNode[]) => nodes.filter((n) => n.affordable).length
  const prestigeOpen = prestige.sales > 0 || prestige.tokens > 0
  type TabInfo = { id: Tab; label: string; badge: number; locked?: boolean }
  const allTabs: TabInfo[] = [
    { id: 'tools', label: '🧰 Herramientas', badge: 0 },
    { id: 'tech', label: 'Tecnologías', badge: available(techNodes) },
    { id: 'personal', label: 'Personal', badge: available(personalNodes) },
    { id: 'company', label: 'Empresa', badge: available(companyNodes) },
    {
      id: 'prestige',
      label: prestigeOpen ? '🪙 Prestigio' : '🔒 Prestigio',
      badge: prestigeOpen ? available(investmentNodes) : 0,
      locked: !prestigeOpen,
    },
  ]
  const tabs = allTabs.filter(
    (t) =>
      (t.id !== 'tools' || features.includes('tools')) &&
      (t.id !== 'company' || features.includes('companyTree')) &&
      (t.id !== 'prestige' || features.includes('prestige')),
  )

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⑂" title="Mejoras">
        Las <b className="text-yellow">herramientas</b> se pagan con dinero; las{' '}
        <b className="text-purple">tecnologías</b> y <b className="text-purple">habilidades</b>, con XP; el{' '}
        <b className="text-purple">prestigio</b>, con tokens. Tocá una mejora para comprarla.
      </ScreenHeader>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
              tab === t.id ? 'border-text bg-text text-bg' : 'border-line bg-panel-2 text-muted hover:text-text'
            } ${t.locked && tab !== t.id ? 'opacity-60' : ''}`}
          >
            {t.label}
            {t.badge > 0 && <span className="rounded-lg bg-purple px-1.5 text-[10px] text-[#1b0f2b]">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'tools' && <div className="max-w-sm">{tools}</div>}

      {tab === 'tech' && (
        <SkillTree
          columns={['fundamentos/', 'base/', 'stack/', 'avanzado/']}
          nodes={techNodes}
          edges={techEdges}
          onBuy={(id) => onLearn(id as TechId)}
        />
      )}

      {tab === 'personal' && (
        <SkillTree
          columns={['base/', 'especialización/', 'profesional/', 'experto/']}
          nodes={personalNodes}
          edges={skillEdges('personal')}
          onBuy={(id) => onBuy(id as SkillId)}
        />
      )}

      {tab === 'company' && (
        <SkillTree
          columns={['equipo/', 'operaciones/', 'escala/']}
          nodes={companyNodes}
          edges={skillEdges('company')}
          onBuy={(id) => onBuy(id as SkillId)}
        />
      )}

      {tab === 'prestige' &&
        (prestigeOpen ? (
          <>
            <p className="mb-3 font-mono text-xs text-muted">
              <span className="text-purple">{prestige.tokens} tokens</span> · estas mejoras sobreviven a cada venta
            </p>
            <p className="mb-4 max-w-xl rounded-xl border border-purple/40 bg-purple/10 px-3.5 py-2.5 text-sm">
              🏛 <b>Experiencia de fundador:</b>{' '}
              <b className="text-purple">+{Math.round((founderBonus(prestige) - 1) * 100)} %</b> de producción (clics y
              equipo). Cada token que ganaste en tu carrera suma +{Math.round(FOUNDER_BONUS * 100)} %, aunque lo hayas
              gastado.
            </p>
            <SkillTree
              columns={['base/', 'avanzado/']}
              nodes={investmentNodes}
              edges={investmentEdges}
              onBuy={(id) => onInvest(id as InvestmentId)}
            />
          </>
        ) : (
          <div className="max-w-md rounded-xl border border-dashed border-line-2 bg-panel-2 p-4 text-sm">
            <p className="mb-1 font-extrabold">🪙 Mejoras permanentes</p>
            <p className="text-muted">
              Vendé tu empresa en la etapa <b className="text-text">Corporación</b> para ganar tokens de inversión.
              Estas mejoras sobreviven a cada venta.
            </p>
          </div>
        ))}
    </section>
  )
}

export default SkillsScreen
