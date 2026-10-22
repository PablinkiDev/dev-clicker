// Etapas de la empresa (GDD §6). Se asciende a mano al cumplir los requisitos.
// Ascender desbloquea cosas, pero no regala producción.

export type StageRequirements = {
  /** Dinero ganado en toda la partida */
  moneyEarned: number
  /** Índice mínimo de oficina en OFFICES */
  office: number
  /** Empleados (sin contarte a vos) */
  team: number
  contractsDone: number
}

export type Stage = {
  name: string
  icon: string
  description: string
  /** Lo que se desbloquea al llegar (texto para la pantalla) */
  unlocks: string
  /** Lo que hace falta para llegar a esta etapa desde la anterior (la primera no tiene) */
  requires: StageRequirements | null
  /** Multiplicador del tamaño y la paga de los contratos en esta etapa (GDD §6: salto al ascender) */
  contractScale: number
  /** Ajuste extra de la paga (balance): en Freelancer se cobra menos, para que el primer empleado cueste */
  payScale?: number
  /** Multiplicador de los precios de empleados y "Buscar otros" (E1): crecen con lo que ganás */
  priceScale: number
}

// Números experimentales: etapa 2 sale del GDD y las demás escalan ×4–5. Se ajustan con la simulación.
export const STAGES: Stage[] = [
  {
    name: 'Freelancer',
    icon: '🧑‍💻',
    description: 'Vos, una compu y clientes que pagan "cuando puedan".',
    unlocks: 'Primeros contratos y primer empleado',
    requires: null,
    contractScale: 1,
    payScale: 0.4,
    priceScale: 1,
  },
  {
    name: 'Estudio',
    icon: '🎨',
    description: 'Ya tenés logo. Lo hizo el sobrino.',
    unlocks: 'Contratos más complejos y empleados de mejor calidad',
    requires: { moneyEarned: 400_000, office: 1, team: 3, contractsDone: 30 },
    contractScale: 2.5,
    priceScale: 3,
  },
  {
    name: 'Startup',
    icon: '🚀',
    description: 'Hay puff en la oficina y la palabra "disruptivo" en la web.',
    unlocks: 'Contratos fullstack y tecnologías avanzadas',
    requires: { moneyEarned: 8_000_000, office: 1, team: 6, contractsDone: 70 },
    contractScale: 6,
    priceScale: 15,
  },
  {
    name: 'Empresa tecnológica',
    icon: '🏢',
    description: 'Tenés un área de RR. HH. que te manda encuestas de clima.',
    unlocks: 'Contratos empresariales y mejoras avanzadas',
    requires: { moneyEarned: 100_000_000, office: 2, team: 10, contractsDone: 120 },
    contractScale: 14,
    priceScale: 80,
  },
  {
    name: 'Corporación',
    icon: '🏙️',
    description: 'Contratos gigantescos y reuniones que podrían haber sido un mail.',
    unlocks: 'Modo infinito y la venta de la empresa',
    requires: { moneyEarned: 500_000_000, office: 2, team: 12, contractsDone: 180 },
    contractScale: 32,
    priceScale: 400,
  },
]
