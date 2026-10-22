// 🏺 Artefactos (F3): objetos de tu escritorio con mejoras permanentes (sobreviven a las ventas).
// Salen de las 📦 cajas de suministros; los repetidos suben de nivel (1 a 10).
// Usan el mismo motor de efectos que las cartas (game/bonuses.ts).
import type { CardEffects } from './cards'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export const RARITIES: Record<Rarity, { name: string; weight: number; text: string; border: string; glow: string }> = {
  common: { name: 'Común', weight: 60, text: 'text-muted', border: 'border-line-2', glow: '' },
  rare: {
    name: 'Raro',
    weight: 28,
    text: 'text-cyan',
    border: 'border-cyan/60',
    glow: 'shadow-[0_0_18px_rgba(137,221,255,.35)]',
  },
  epic: {
    name: 'Épico',
    weight: 10,
    text: 'text-purple',
    border: 'border-purple/70',
    glow: 'shadow-[0_0_22px_rgba(199,146,234,.45)]',
  },
  legendary: {
    name: 'Legendario',
    weight: 2,
    text: 'text-yellow',
    border: 'border-yellow',
    glow: 'shadow-[0_0_30px_rgba(255,203,107,.6)]',
  },
}

export const MAX_ARTIFACT_LEVEL = 10

export type Artifact = {
  id: string
  icon: string
  name: string
  rarity: Rarity
  /** Qué hace con este nivel */
  text: (level: number) => string
  effects: (level: number) => Partial<CardEffects>
}

const pct = (n: number) => `${Math.round(n * 100)} %`

export const ARTIFACTS: Artifact[] = [
  // ⚪ Comunes
  {
    id: 'keyboard',
    icon: '⌨️',
    name: 'Teclado mecánico',
    rarity: 'common',
    text: (l) => `Clics +${pct(0.08 * l)}`,
    effects: (l) => ({ clickMult: 1 + 0.08 * l }),
  },
  {
    id: 'mouse',
    icon: '🖱️',
    name: 'Mouse gamer',
    rarity: 'common',
    text: (l) => `+${pct(0.01 * l)} de probabilidad de crítico`,
    effects: (l) => ({ critChance: 0.01 * l }),
  },
  {
    id: 'monitor',
    icon: '🖥️',
    name: 'Monitor ultrawide',
    rarity: 'common',
    text: (l) => `Equipo +${pct(0.08 * l)}`,
    effects: (l) => ({ autoMult: 1 + 0.08 * l }),
  },
  {
    id: 'mug',
    icon: '☕',
    name: 'Taza infinita',
    rarity: 'common',
    text: (l) => `El Foco y las habilidades duran +${pct(0.06 * l)}`,
    effects: (l) => ({ durationMult: 1 + 0.06 * l }),
  },
  {
    id: 'plant',
    icon: '🪴',
    name: 'Plantita',
    rarity: 'common',
    text: (l) => `+${pct(0.08 * l)} de XP`,
    effects: (l) => ({ xpMult: 1 + 0.08 * l }),
  },
  {
    id: 'postits',
    icon: '🗒️',
    name: 'Pila de post-its',
    rarity: 'common',
    text: (l) => `Los contratos nuevos tienen +${pct(0.03 * l)} de plazo`,
    effects: (l) => ({ timeMult: 1 + 0.03 * l }),
  },
  // 🔵 Raros
  {
    id: 'headphones',
    icon: '🎧',
    name: 'Auriculares con cancelación de ruido',
    rarity: 'rare',
    text: (l) => `Los efectos malos de los eventos duran −${pct(1 - Math.pow(0.93, l))}`,
    effects: (l) => ({ badEventMult: Math.pow(0.93, l) }),
  },
  {
    id: 'chair',
    icon: '🪑',
    name: 'Silla ergonómica',
    rarity: 'rare',
    text: (l) => `El Foco y las habilidades recargan −${pct(1 - Math.pow(0.96, l))}`,
    effects: (l) => ({ cooldownMult: Math.pow(0.96, l) }),
  },
  {
    id: 'patternsBook',
    icon: '📚',
    name: 'Libro de patrones de diseño',
    rarity: 'rare',
    text: (l) => `Los contratos pagan +${pct(0.06 * l)}`,
    effects: (l) => ({ payMult: 1 + 0.06 * l }),
  },
  {
    id: 'joystick',
    icon: '🎮',
    name: 'Joystick de la sala de juegos',
    rarity: 'rare',
    text: (l) => `El premio de los minijuegos es +${pct(0.06 * l)} más fuerte`,
    effects: (l) => ({ minigameMult: 1 + 0.06 * l }),
  },
  // 🟣 Épicos
  {
    id: 'rubberDuck',
    icon: '🦆',
    name: 'Patito de goma',
    rarity: 'epic',
    text: (l) => `Le explicás el código y lo entendés: los contratos piden −${pct(1 - Math.pow(0.97, l))} de código`,
    effects: (l) => ({ codeMult: Math.pow(0.97, l) }),
  },
  {
    id: 'closetServer',
    icon: '🗄️',
    name: 'Servidor en el placard',
    rarity: 'epic',
    text: (l) => `Tu Macro de teclado hace +${(0.2 * l).toLocaleString('es-AR')} clics/s`,
    effects: (l) => ({ macroCps: 0.2 * l }),
  },
  {
    id: 'magnet',
    icon: '🧲',
    name: 'Imán "It works on my machine"',
    rarity: 'epic',
    text: (l) => `+${pct(0.15 * l)} de contratos especiales`,
    effects: (l) => ({ specialMult: 1 + 0.15 * l }),
  },
  // 🟡 Legendarios
  {
    id: 'stickerLaptop',
    icon: '💻',
    name: 'Laptop con stickers',
    rarity: 'legendary',
    text: (l) => `+${Math.ceil(l / 2)} token${Math.ceil(l / 2) > 1 ? 's' : ''} al vender cada empresa`,
    effects: (l) => ({ saleTokens: Math.ceil(l / 2) }),
  },
  {
    id: 'hackathonTrophy',
    icon: '🏆',
    name: 'Trofeo de hackatón',
    rarity: 'legendary',
    text: (l) => `La Hackatón multiplica +${(0.5 * l).toLocaleString('es-AR')} más`,
    effects: (l) => ({ hackathonExtra: 0.5 * l }),
  },
  {
    id: 'crystalBall',
    icon: '🔮',
    name: 'Bola de cristal de Stack Overflow',
    rarity: 'legendary',
    text: (l) => `+${pct(0.03 * l)} de chance de ganar las apuestas de los eventos`,
    effects: (l) => ({ luck: 0.3 * l }),
  },
]

export const getArtifact = (id: string) => ARTIFACTS.find((a) => a.id === id)

/** Niveles de los artefactos que tenés (id → nivel) */
export type ArtifactLevels = Record<string, number>

/**
 * Qué sale al abrir una caja: primero la rareza (por peso) y después un artefacto de esa rareza
 * que no esté al máximo. Usa azar: se llama afuera del reducer. null si ya tenés todo al máximo.
 */
export function rollArtifact(levels: ArtifactLevels): string | null {
  const open = ARTIFACTS.filter((a) => (levels[a.id] ?? 0) < MAX_ARTIFACT_LEVEL)
  if (open.length === 0) return null
  const rarities = (Object.keys(RARITIES) as Rarity[]).filter((r) => open.some((a) => a.rarity === r))
  const total = rarities.reduce((sum, r) => sum + RARITIES[r].weight, 0)
  let roll = Math.random() * total
  let rarity = rarities[rarities.length - 1]
  for (const r of rarities) {
    roll -= RARITIES[r].weight
    if (roll <= 0) {
      rarity = r
      break
    }
  }
  const pool = open.filter((a) => a.rarity === rarity)
  return pool[Math.floor(Math.random() * pool.length)].id
}

/** Precio en tokens de la próxima caja comprada (sube ×1,5 cada vez) */
export function boxPrice(bought: number): number {
  return Math.ceil(3 * Math.pow(1.5, bought))
}
