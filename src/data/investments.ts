// Árbol de prestigio (GDD §10): mejoras permanentes que se compran con tokens de inversión.
// Sobreviven a la venta de la empresa. Costo: 1, 2, 4, 8 y 16 tokens por nivel.

export type InvestmentId =
  'legacyCode' | 'seniorTeam' | 'premiumContracts' | 'fastLearning' | 'seedCapital' | 'firstContacts'

export type Investment = {
  id: InvestmentId
  branch: 'Productividad' | 'Rentabilidad' | 'Innovación'
  name: string
  icon: string
  effect: string
  maxLevel: number
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
}

export const INVESTMENTS: Investment[] = [
  {
    id: 'legacyCode',
    branch: 'Productividad',
    name: 'Código heredado',
    icon: '📜',
    effect: '+20 % líneas por clic por nivel',
    maxLevel: 5,
  },
  {
    id: 'seniorTeam',
    branch: 'Productividad',
    name: 'Equipo experimentado',
    icon: '🧓',
    effect: '+20 % producción automática por nivel',
    maxLevel: 5,
    requires: 'legacyCode',
  },
  {
    id: 'premiumContracts',
    branch: 'Rentabilidad',
    name: 'Contratos premium',
    icon: '💎',
    effect: '+20 % de dinero por contrato por nivel',
    maxLevel: 5,
  },
  {
    id: 'fastLearning',
    branch: 'Rentabilidad',
    name: 'Aprendizaje acelerado',
    icon: '📚',
    effect: '+20 % de XP por contrato por nivel',
    maxLevel: 5,
    requires: 'premiumContracts',
  },
  {
    id: 'seedCapital',
    branch: 'Innovación',
    name: 'Capital semilla',
    icon: '🌱',
    effect: '+$2.000 al empezar cada empresa por nivel',
    maxLevel: 5,
  },
  {
    id: 'firstContacts',
    branch: 'Innovación',
    name: 'Primeros contactos',
    icon: '🤝',
    effect: '+5 ★ de reputación al empezar por nivel',
    maxLevel: 5,
    requires: 'seedCapital',
  },
]

/** Costo del siguiente nivel: 1 × 2^(nivel actual) → 1, 2, 4, 8, 16 */
export function investmentCost(level: number): number {
  return Math.pow(2, level)
}
