// 🎨 Personalización (G4): tu empresa (nombre y logo), tu avatar, tu título y la mascota de la oficina.
// No da bonus: es para que la partida se sienta tuya. Algunas cosas se desbloquean con logros.

// --- 🏢 Tu empresa ----------------------------------------------------------------------

export type CompanyIdentity = { name: string; emoji: string; color: string }

/** Largo máximo del nombre (para que entre en la barra lateral y el historial) */
export const COMPANY_NAME_MAX = 24

export const COMPANY_NAMES: string[] = [
  'Bugs & Cía.',
  'Ctrl+Z S.A.',
  '404 Studios',
  'Café y Código SRL',
  'Deploy los Viernes',
  'Hola Mundo S.A.',
  'Pixel Perfecto',
  'Punto y Coma Labs',
  'Patito de Goma Inc.',
  'Startup del Garage',
  'Merge Conflict SRL',
  'Null & Asociados',
  'Localhost 3000',
  'En Mi Máquina Anda',
  'Mate & Commit',
  'Sprint Eterno S.A.',
  'Stack Overflow Pero Bien',
  'Spaghetti Code Co.',
]

export const LOGO_EMOJIS: string[] = [
  '💻',
  '🚀',
  '🦄',
  '🐙',
  '🦊',
  '🔥',
  '⚡',
  '🌵',
  '🍕',
  '🧉',
  '🐢',
  '🦆',
  '🌈',
  '🎯',
  '🧠',
  '👾',
]

/** Colores del logo (clases completas para Tailwind) */
export const LOGO_COLORS: { id: string; bg: string }[] = [
  { id: 'green', bg: 'bg-[#1f9d55]' },
  { id: 'blue', bg: 'bg-[#2c5bd1]' },
  { id: 'purple', bg: 'bg-[#8e44ad]' },
  { id: 'red', bg: 'bg-[#b4233a]' },
  { id: 'orange', bg: 'bg-[#c9620a]' },
  { id: 'yellow', bg: 'bg-[#b8860b]' },
  { id: 'cyan', bg: 'bg-[#1f8fbf]' },
  { id: 'gray', bg: 'bg-[#4a5372]' },
]

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)]

/** Una empresa al azar (usa azar: se llama afuera del reducer) */
export function randomCompany(): CompanyIdentity {
  return { name: pick(COMPANY_NAMES), emoji: pick(LOGO_EMOJIS), color: pick(LOGO_COLORS).id }
}

export const DEFAULT_COMPANY: CompanyIdentity = { name: 'Mi Startup', emoji: '💻', color: 'green' }

/** Limpia lo que escribió el jugador (o lo que venga de un guardado): nombre corto y opciones que existen */
export function cleanCompany(company: Partial<CompanyIdentity> | undefined): CompanyIdentity {
  const name = typeof company?.name === 'string' ? company.name.replace(/\s+/g, ' ').trim() : ''
  return {
    name: [...name].slice(0, COMPANY_NAME_MAX).join('') || DEFAULT_COMPANY.name,
    emoji: LOGO_EMOJIS.includes(company?.emoji ?? '') ? company!.emoji! : DEFAULT_COMPANY.emoji,
    color: LOGO_COLORS.some((c) => c.id === company?.color) ? company!.color! : DEFAULT_COMPANY.color,
  }
}

export const logoBg = (color: string) => LOGO_COLORS.find((c) => c.id === color)?.bg ?? LOGO_COLORS[0].bg

// --- 🧑‍💻 Tu avatar -----------------------------------------------------------------------

/** Algo que se puede elegir; si tiene `unlock`, hace falta ese logro */
export type Choice = { id: string; name: string; unlock?: string }

export const SKINS: (Choice & { hex: string })[] = [
  { id: 'light', name: 'Tono 1', hex: '#f5d0b0' },
  { id: 'medium', name: 'Tono 2', hex: '#e0ac85' },
  { id: 'tan', name: 'Tono 3', hex: '#b97a56' },
  { id: 'dark', name: 'Tono 4', hex: '#7a4a2e' },
]

export const HOODIES: (Choice & { hex: string })[] = [
  { id: 'green', name: 'Verde', hex: '#1f9d55' },
  { id: 'blue', name: 'Azul', hex: '#2c5bd1' },
  { id: 'purple', name: 'Violeta', hex: '#8e44ad' },
  { id: 'red', name: 'Rojo', hex: '#b4233a' },
  { id: 'orange', name: 'Naranja', hex: '#c9620a' },
  { id: 'gray', name: 'Gris', hex: '#4a5372' },
  { id: 'black', name: 'Negro de hacker', hex: '#161616', unlock: 'contracts1000' },
  { id: 'gold', name: 'Dorado de unicornio', hex: '#d4a017', unlock: 'unicorn' },
]

export const HEAD_ITEMS: Choice[] = [
  { id: 'none', name: 'Nada' },
  { id: 'beanie', name: 'Gorro de lana' },
  { id: 'headphones', name: 'Auriculares' },
  { id: 'cap', name: 'Gorra', unlock: 'firstBoss' },
  { id: 'antennae', name: 'Antenas de bug', unlock: 'exterminator' },
  { id: 'crown', name: 'Corona', unlock: 'ipo' },
]

export const FACE_ITEMS: Choice[] = [
  { id: 'none', name: 'Nada' },
  { id: 'glasses', name: 'Anteojos' },
  { id: 'sunglasses', name: 'Anteojos de sol', unlock: 'critStorm' },
  { id: 'mustache', name: 'Bigote corporativo', unlock: 'corporate' },
]

// --- 🏷 Títulos ---------------------------------------------------------------------------

export const TITLES: Choice[] = [
  { id: 'junior', name: 'Junior entusiasta', unlock: 'hello' },
  { id: 'pianist', name: 'Pianista del teclado', unlock: 'clicks10k' },
  { id: 'bugHunter', name: 'Cazador de bugs', unlock: 'exterminator' },
  { id: 'startupKing', name: 'Rey de las startups', unlock: 'startup' },
  { id: 'corporate', name: 'Ejecutivo corporativo', unlock: 'corporate' },
  { id: 'unicorn', name: 'Unicornio', unlock: 'unicorn' },
  { id: 'lucky', name: 'Suertudo profesional', unlock: 'luckyStreak' },
  { id: 'reviewer', name: 'Senior reviewer', unlock: 'seniorReviewer' },
  { id: 'tamer', name: 'Domador de clientes', unlock: 'bosses10' },
  { id: 'collector', name: 'Coleccionista', unlock: 'artifacts8' },
  { id: 'masochist', name: 'Masoquista', unlock: 'masochist' },
  { id: 'multi', name: 'Líder multidisciplinario', unlock: 'allRoles' },
  { id: 'legend', name: 'Leyenda de Silicon Valley', unlock: 'ipo' },
]

// --- 🐈 Mascota de la oficina --------------------------------------------------------------

export type MascotId = 'cat' | 'dog' | 'duck'

export const MASCOTS: { id: MascotId; icon: string; name: string }[] = [
  { id: 'cat', icon: '🐈', name: 'Gato' },
  { id: 'dog', icon: '🐕', name: 'Perro' },
  { id: 'duck', icon: '🦆', name: 'Pato' },
]

/** Cada cuánto pasea la mascota por la pantalla: de 45 a 90 s */
export const nextMascotWalk = () => (45 + Math.random() * 45) * 1000
/** Cuánto tarda en cruzar la pantalla (s) */
export const MASCOT_WALK_SECONDS = 14

// --- Perfil ----------------------------------------------------------------------------------

export type Profile = {
  skin: string
  hoodie: string
  head: string
  face: string
  /** Título elegido para mostrar (o null) */
  title: string | null
  mascot: MascotId | null
}

export const DEFAULT_PROFILE: Profile = {
  skin: 'medium',
  hoodie: 'green',
  head: 'none',
  face: 'none',
  title: null,
  mascot: null,
}

/** ¿Ya se puede usar? */
export const isUnlocked = (choice: Choice, unlocked: string[]) => !choice.unlock || unlocked.includes(choice.unlock)

/**
 * Deja solo lo que existe y está desbloqueado (para los cambios del jugador y los guardados).
 * Lo que no vale vuelve a lo de siempre.
 */
export function cleanProfile(profile: Partial<Profile> | undefined, unlocked: string[]): Profile {
  const valid = (list: Choice[], id: unknown, fallback: string) => {
    const choice = list.find((c) => c.id === id)
    return choice && isUnlocked(choice, unlocked) ? choice.id : fallback
  }
  const title = TITLES.find((t) => t.id === profile?.title)
  return {
    skin: valid(SKINS, profile?.skin, DEFAULT_PROFILE.skin),
    hoodie: valid(HOODIES, profile?.hoodie, DEFAULT_PROFILE.hoodie),
    head: valid(HEAD_ITEMS, profile?.head, 'none'),
    face: valid(FACE_ITEMS, profile?.face, 'none'),
    title: title && isUnlocked(title, unlocked) ? title.id : null,
    mascot: MASCOTS.find((m) => m.id === profile?.mascot)?.id ?? null,
  }
}

export const titleName = (id: string | null) => TITLES.find((t) => t.id === id)?.name ?? null
