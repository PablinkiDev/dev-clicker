// Árbol de prestigio (GDD §10): mejoras permanentes que se compran con tokens de inversión.
// Sobreviven a la venta de la empresa. Costo: base × 2^nivel (1, 2, 4, 8… tokens).
// E5: las mejoras de porcentaje dan +50 % por nivel y llegan a Nv.10 (completarlas pide muchas ventas),
// y la rama Arranque hace que cada empresa nueva empiece más adelante.

export type InvestmentId =
  | 'legacyCode'
  | 'seniorTeam'
  | 'premiumContracts'
  | 'fastLearning'
  | 'seedCapital'
  | 'firstContacts'
  | 'portfolio'
  | 'license'
  | 'cofounder'
  | 'processes'

export type Investment = {
  id: InvestmentId
  branch: 'Productividad' | 'Rentabilidad' | 'Innovación' | 'Arranque'
  name: string
  icon: string
  effect: string
  maxLevel: number
  /** Tokens del primer nivel (si falta, 1) */
  baseCost?: number
  /** Otra mejora que hace falta tener al menos en nivel 1 */
  requires?: InvestmentId
}

export type InvestmentLevels = Record<InvestmentId, number>

export const INITIAL_INVESTMENTS: InvestmentLevels = {
  legacyCode: 0,
  seniorTeam: 0,
  premiumContracts: 0,
  fastLearning: 0,
  seedCapital: 0,
  firstContacts: 0,
  portfolio: 0,
  license: 0,
  cofounder: 0,
  processes: 0,
}

/** Lo que suma cada nivel de las mejoras de porcentaje */
export const INVESTMENT_STEP = 0.5

/** Capital semilla y Primeros contactos, por nivel */
export const SEED_CAPITAL = 25_000
export const FIRST_CONTACTS_REP = 30

export const INVESTMENTS: Investment[] = [
  {
    id: 'legacyCode',
    branch: 'Productividad',
    name: 'Código heredado',
    icon: '📜',
    effect: '+50 % líneas por clic por nivel',
    maxLevel: 10,
  },
  {
    id: 'seniorTeam',
    branch: 'Productividad',
    name: 'Equipo experimentado',
    icon: '🧓',
    effect: '+50 % producción automática por nivel',
    maxLevel: 10,
    requires: 'legacyCode',
  },
  {
    id: 'premiumContracts',
    branch: 'Rentabilidad',
    name: 'Contratos premium',
    icon: '💎',
    effect: '+50 % de dinero por contrato por nivel',
    maxLevel: 10,
  },
  {
    id: 'fastLearning',
    branch: 'Rentabilidad',
    name: 'Aprendizaje acelerado',
    icon: '📚',
    effect: '+50 % de XP por contrato por nivel',
    maxLevel: 10,
    requires: 'premiumContracts',
  },
  {
    id: 'seedCapital',
    branch: 'Innovación',
    name: 'Capital semilla',
    icon: '🌱',
    effect: '+$25.000 al empezar cada empresa por nivel',
    maxLevel: 5,
  },
  {
    id: 'firstContacts',
    branch: 'Innovación',
    name: 'Primeros contactos',
    icon: '🤝',
    effect: '+30 ★ de reputación al empezar por nivel (un nivel de ofertas)',
    maxLevel: 4,
    requires: 'seedCapital',
  },
  {
    id: 'portfolio',
    branch: 'Arranque',
    name: 'Portfolio',
    icon: '📦',
    effect: 'Empezás con HTML, CSS y JavaScript en Nv.3 (Nv.5 con el nivel 2)',
    maxLevel: 2,
    baseCost: 2,
  },
  {
    id: 'license',
    branch: 'Arranque',
    name: 'Licencia vitalicia',
    icon: '🛠',
    effect: 'Empezás con Sublimado Text (con el nivel 2, Visual Estudio Code)',
    maxLevel: 2,
    baseCost: 2,
    requires: 'portfolio',
  },
  {
    id: 'cofounder',
    branch: 'Arranque',
    name: 'Socio fundador',
    icon: '👥',
    effect: 'Tu mejor empleado se va con vos a la empresa nueva',
    maxLevel: 1,
    baseCost: 3,
  },
  {
    id: 'processes',
    branch: 'Arranque',
    name: 'Procesos heredados',
    icon: '⚙️',
    effect: 'Empezás con Entrega continua y Captación automática',
    maxLevel: 1,
    baseCost: 4,
    requires: 'cofounder',
  },
]

/** Costo del siguiente nivel: base × 2^(nivel actual) */
export function investmentCost(investment: Investment, level: number): number {
  return (investment.baseCost ?? 1) * Math.pow(2, level)
}
