// 🔓 Revelado progresivo: cada mecánica aparece recién cuando se vuelve útil, y se celebra.
// Lo desbloqueado se guarda para toda la carrera (no se vuelve a anunciar después de vender).
import type { GameState } from '../game/reducer'
import type { View } from '../ui'

export type FeatureId = 'upgrades' | 'tools' | 'team' | 'company' | 'companyTree' | 'minigames' | 'macro' | 'prestige'

export type Feature = {
  id: FeatureId
  icon: string
  name: string
  /** Explicación corta: es el mini tutorial de esta mecánica */
  text: string
  /** Pantalla a la que lleva "Ver ahora" (y que se marca con ● hasta visitarla) */
  view?: View
  check: (state: GameState) => boolean
}

// Cada condición también mira la etapa: una partida que ya pasó esa parte del juego la tiene revelada
export const FEATURES: Feature[] = [
  {
    id: 'upgrades',
    icon: '🧠',
    name: 'Mejoras',
    text: 'Gastá tu XP en tecnologías y habilidades: más líneas por clic y contratos nuevos.',
    view: 'skills',
    check: (s) => s.records.contracts >= 1 || s.stats.contractsDone >= 1 || s.stage >= 1,
  },
  {
    id: 'tools',
    icon: '🧰',
    name: 'Herramientas',
    text: 'Comprá editores mejores con dinero. Cada uno cambia el aspecto del juego y te da un bonus. Están en Mejoras.',
    view: 'skills',
    check: (s) => s.stats.moneyEarned >= 1000 || s.editor !== 'nano' || s.stage >= 1,
  },
  {
    id: 'team',
    icon: '👥',
    name: 'Equipo',
    text: 'Contratá gente. Los desarrolladores escriben código solos, aunque no hagas clic. Empezá por uno.',
    view: 'team',
    check: (s) => s.stats.moneyEarned >= 4000 || s.team.length >= 1 || s.stage >= 1,
  },
  {
    id: 'company',
    icon: '▲',
    name: 'Empresa',
    text: 'Cumplí los requisitos para ascender de etapa: contratos más grandes y cosas nuevas. Acá también están tus logros.',
    view: 'company',
    check: (s) => s.team.length >= 1 || s.stage >= 1,
  },
  {
    id: 'companyTree',
    icon: '🏢',
    name: 'Árbol Empresa',
    text: 'Mejoras para tu equipo y tu empresa: entrega automática, más producción y más. Está en Mejoras.',
    view: 'skills',
    check: (s) => s.stage >= 1,
  },
  {
    id: 'minigames',
    icon: '🎮',
    name: 'Minijuegos',
    text: 'Cada tanto te van a invitar a un minijuego. Son opcionales: si te va bien, tu equipo produce más por un rato.',
    check: (s) => s.stage >= 1,
  },
  {
    id: 'macro',
    icon: '🤖',
    name: 'Macro de teclado',
    text: 'Una herramienta que hace clic sola mientras trabajás. Está en Mejoras → Herramientas.',
    view: 'skills',
    check: (s) => s.stage >= 2,
  },
  {
    id: 'prestige',
    icon: '🪙',
    name: 'Vender la empresa',
    text: 'Ya podés vender tu empresa: empezás de cero, pero ganás tokens para mejoras que duran para siempre.',
    view: 'company',
    check: (s) => s.stage >= 4 || s.prestige.sales > 0,
  },
]

/** Pantallas que siempre se ven (las demás aparecen con su funcionalidad) */
const ALWAYS: View[] = ['work', 'board', 'settings']

/** ¿Se ve esta pantalla con lo desbloqueado hasta ahora? */
export function isViewVisible(view: View, features: string[]): boolean {
  return ALWAYS.includes(view) || FEATURES.some((f) => f.view === view && features.includes(f.id))
}

/** Funcionalidades que corresponden a un estado (para partidas viejas: se desbloquean sin anunciar) */
export function featuresFor(state: GameState): FeatureId[] {
  return FEATURES.filter((f) => f.check(state)).map((f) => f.id)
}
