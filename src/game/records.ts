// Récords de toda la carrera (D8): contadores y logros. Sobreviven a vender la empresa.

export type Records = {
  /** Logros desbloqueados, en el orden en que se consiguieron */
  unlocked: string[]
  /** 🔓 Funcionalidades ya reveladas (data/features.ts) */
  features: string[]
  clicks: number
  crits: number
  /** Líneas escritas en total (clics + equipo) */
  lines: number
  contracts: number
  specials: number
  /** Empleados reemplazados (despedidos para hacer lugar) */
  replacements: number
  /** Opciones con azar de los eventos que salieron bien */
  betsWon: number
  bugs: number
  /** Minijuegos jugados (D9) */
  minigames: number
  /** 👹 Clientes jefe derrotados */
  bosses: number
  /** 📦 Cajas de suministros sin abrir (F3) */
  boxes: number
  /** Eventos buenos seguidos */
  goodStreak: number
  /** Hora de los últimos críticos (para "Modo máquina") */
  recentCrits: number[]
}

export const INITIAL_RECORDS: Records = {
  unlocked: [],
  features: [],
  clicks: 0,
  crits: 0,
  lines: 0,
  contracts: 0,
  specials: 0,
  replacements: 0,
  betsWon: 0,
  bugs: 0,
  minigames: 0,
  bosses: 0,
  boxes: 0,
  goodStreak: 0,
  recentCrits: [],
}

/** Cada logro suma +1 % de producción (clics y equipo) */
export const ACHIEVEMENT_BONUS = 0.01

export function achievementMultiplier(records: Records): number {
  return 1 + ACHIEVEMENT_BONUS * records.unlocked.length
}
