// Logros (D8): cada uno da +1 % de producción para siempre (no se pierden al vender la empresa).
// Cada logro mira el estado de antes y de después de una acción: si se cumple, se desbloquea.
import type { GameAction, GameState } from '../game/reducer'
import { companyValue } from '../game/stages'
import { CORPORATE_OFFICE, OFFICES, officeCapacity } from './offices'
import { ROLE_IDS } from './roles'
import { CHALLENGES } from './challenges'
import { ARTIFACTS, MAX_ARTIFACT_LEVEL, getArtifact } from './artifacts'
import { CARDS, getCard } from './cards'
import { tokensEarned } from '../game/prestige'

export type AchievementCategory =
  'code' | 'contracts' | 'team' | 'company' | 'tools' | 'luck' | 'games' | 'collection' | 'secret'

export const CATEGORIES: { id: AchievementCategory; icon: string; name: string }[] = [
  { id: 'code', icon: '⌨️', name: 'Programar' },
  { id: 'contracts', icon: '📄', name: 'Contratos' },
  { id: 'team', icon: '👥', name: 'Equipo' },
  { id: 'company', icon: '💰', name: 'Empresa' },
  { id: 'tools', icon: '🛠', name: 'Herramientas' },
  { id: 'luck', icon: '🎲', name: 'Suerte' },
  { id: 'games', icon: '🎮', name: 'Minijuegos' },
  { id: 'collection', icon: '🏺', name: 'Colección' },
  { id: 'secret', icon: '🔒', name: 'Secretos' },
]

export type AchievementCheck = { prev: GameState; next: GameState; action: GameAction }

export type Achievement = {
  id: string
  category: AchievementCategory
  icon: string
  name: string
  description: string
  /** Secreto: no se ve qué pide hasta conseguirlo */
  secret?: boolean
  check: (c: AchievementCheck) => boolean
  /** Progreso para la barra [actual, meta] (solo los que son contadores) */
  progress?: (s: GameState) => [number, number]
}

/** Logro de contador: se cumple al llegar a la meta y muestra su barra */
function counter(
  base: Omit<Achievement, 'check' | 'progress'>,
  value: (s: GameState) => number,
  goal: number,
): Achievement {
  return { ...base, check: ({ next }) => value(next) >= goal, progress: (s) => [Math.min(goal, value(s)), goal] }
}

/** ¿Esta acción entregó un contrato? */
const delivered = ({ prev, next }: AchievementCheck) => next.records.contracts > prev.records.contracts
/** Artefactos distintos que tenés y cajas abiertas (cada nivel salió de una caja) */
const artifactCount = (s: GameState) => Object.keys(s.records.artifacts).length
const boxesOpened = (s: GameState) => Object.values(s.records.artifacts).reduce((sum, level) => sum + level, 0)
/** Cartas de la empresa actual por estilo */
const cardStyles = (s: GameState) => s.cards.map((c) => getCard(c.id)?.style)

const corporateFull = (s: GameState) =>
  s.office >= CORPORATE_OFFICE && s.team.length >= officeCapacity(CORPORATE_OFFICE, s.skills.homeOffice)
const campusFull = (s: GameState) =>
  s.office === OFFICES.length - 1 && s.team.length >= officeCapacity(s.office, s.skills.homeOffice)

export const ACHIEVEMENTS: Achievement[] = [
  // ⌨️ Programar
  counter(
    { id: 'hello', category: 'code', icon: '👋', name: 'Hola mundo', description: 'Hacé tu primer clic' },
    (s) => s.records.clicks,
    1,
  ),
  counter(
    { id: 'clicks1k', category: 'code', icon: '🦾', name: 'Dedos de acero', description: '1.000 clics' },
    (s) => s.records.clicks,
    1000,
  ),
  counter(
    { id: 'clicks10k', category: 'code', icon: '🩹', name: 'Tendinitis', description: '10.000 clics' },
    (s) => s.records.clicks,
    10_000,
  ),
  counter(
    { id: 'crits50', category: 'code', icon: '🗡️', name: 'Filo infinito', description: '50 críticos en total' },
    (s) => s.records.crits,
    50,
  ),
  counter(
    { id: 'crits100', category: 'code', icon: '🎬', name: 'Crítico de cine', description: '100 críticos en total' },
    (s) => s.records.crits,
    100,
  ),
  {
    id: 'critStorm',
    category: 'code',
    icon: '🤖',
    name: 'Modo máquina',
    description: '20 críticos en 30 segundos',
    check: ({ next }) => {
      const t = next.records.recentCrits
      return t.length >= 20 && t[t.length - 1] - t[t.length - 20] <= 30_000
    },
  },
  counter(
    {
      id: 'lines100k',
      category: 'code',
      icon: '📋',
      name: 'Copy-paste profesional',
      description: '100.000 líneas escritas en total',
    },
    (s) => s.records.lines,
    100_000,
  ),
  counter(
    {
      id: 'lines1m',
      category: 'code',
      icon: '🍝',
      name: 'Código espagueti',
      description: '1.000.000 de líneas escritas en total',
    },
    (s) => s.records.lines,
    1_000_000,
  ),

  // 📄 Contratos
  counter(
    {
      id: 'firstClient',
      category: 'contracts',
      icon: '🤝',
      name: 'Primer cliente',
      description: 'Entregá tu primer contrato',
    },
    (s) => s.records.contracts,
    1,
  ),
  counter(
    {
      id: 'contracts100',
      category: 'contracts',
      icon: '🔁',
      name: 'Freelancer serial',
      description: '100 contratos entregados',
    },
    (s) => s.records.contracts,
    100,
  ),
  counter(
    {
      id: 'contracts1000',
      category: 'contracts',
      icon: '🏭',
      name: 'Fábrica de software',
      description: '1.000 contratos entregados',
    },
    (s) => s.records.contracts,
    1000,
  ),
  {
    id: 'cousin',
    category: 'contracts',
    icon: '👨‍👦',
    name: 'El primo ganó',
    description: 'Dejá vencer un contrato',
    check: ({ prev, next }) => next.stats.contractsFailed > prev.stats.contractsFailed,
  },
  {
    id: 'lastSecond',
    category: 'contracts',
    icon: '⏱️',
    name: 'Sobre la hora',
    description: 'Entregá con menos de 3 segundos en el reloj',
    check: (c) => delivered(c) && c.prev.timeLeft < 3,
  },
  counter(
    {
      id: 'gold5',
      category: 'contracts',
      icon: '⭐',
      name: 'Cazador de oro',
      description: 'Entregá 5 contratos especiales',
    },
    (s) => s.records.specials,
    5,
  ),
  {
    id: 'fullstack',
    category: 'contracts',
    icon: '🧱',
    name: 'Fullstack de verdad',
    description: 'Entregá un contrato fullstack',
    check: (c) => delivered(c) && (c.prev.contract?.stack?.length ?? 0) > 0,
  },
  {
    id: 'delegate',
    category: 'contracts',
    icon: '🧘',
    name: 'Delegar es de líderes',
    description: 'Entregá un contrato sin hacer ni un clic',
    check: (c) => delivered(c) && c.action.type !== 'program' && c.prev.contractClicks === 0,
  },

  // 👥 Equipo
  counter(
    {
      id: 'firstHire',
      category: 'team',
      icon: '🙋',
      name: 'Ya no estoy solo',
      description: 'Contratá a tu primer empleado',
    },
    (s) => s.team.length,
    1,
  ),
  {
    id: 'fiveStars',
    category: 'team',
    icon: '🌟',
    name: 'Cinco estrellas',
    description: 'Tené un empleado 5★',
    check: ({ next }) => next.team.some((e) => e.stars >= 5),
  },
  {
    id: 'fullHouse',
    category: 'team',
    icon: '🏢',
    name: 'Casa llena',
    description: 'Llená la oficina corporativa',
    check: ({ next }) => corporateFull(next),
  },
  {
    id: 'onlySenior',
    category: 'team',
    icon: '🎓',
    name: 'Only Senior',
    description: 'Llená la oficina corporativa solo con empleados 5★',
    check: ({ next }) => corporateFull(next) && next.team.every((e) => e.stars >= 5),
  },
  {
    id: 'aiReplace',
    category: 'team',
    icon: '🦾',
    name: 'Nos va a reemplazar la IA',
    description: 'Llená la oficina corporativa sin ningún desarrollador',
    check: ({ next }) => corporateFull(next) && next.team.every((e) => e.role !== 'dev'),
  },
  {
    id: 'campusFull',
    category: 'team',
    icon: '🌳',
    name: 'Ciudad universitaria',
    description: 'Llená el Campus',
    check: ({ next }) => campusFull(next),
  },
  {
    id: 'allRoles',
    category: 'team',
    icon: '🌈',
    name: 'Equipo multidisciplinario',
    description: `Tené las ${ROLE_IDS.length} profesiones en el equipo a la vez`,
    check: ({ next }) => ROLE_IDS.every((r) => next.team.some((e) => e.role === r)),
  },
  counter(
    {
      id: 'replace10',
      category: 'team',
      icon: '📦',
      name: 'Despidos masivos',
      description: 'Reemplazá a 10 empleados',
    },
    (s) => s.records.replacements,
    10,
  ),
  counter(
    {
      id: 'replace50',
      category: 'team',
      icon: '🚪',
      name: 'Rotación de personal',
      description: 'Reemplazá a 50 empleados',
    },
    (s) => s.records.replacements,
    50,
  ),

  // 💰 Empresa
  counter(
    { id: 'million', category: 'company', icon: '💵', name: 'Primer palo', description: 'Ganá $1 M en una empresa' },
    (s) => s.stats.moneyEarned,
    1e6,
  ),
  counter(
    { id: 'unicorn', category: 'company', icon: '🦄', name: 'Unicornio', description: 'Que tu empresa valga $1 B' },
    (s) => companyValue(s.stats.moneyEarned, s.team),
    1e9,
  ),
  {
    id: 'startup',
    category: 'company',
    icon: '🚀',
    name: 'Escalando',
    description: 'Llegá a Startup',
    check: ({ next }) => next.stage >= 2,
  },
  {
    id: 'corporate',
    category: 'company',
    icon: '🏙️',
    name: 'Corporativo',
    description: 'Llegá a Corporación',
    check: ({ next }) => next.stage >= 4,
  },
  counter(
    { id: 'exit', category: 'company', icon: '💼', name: 'Exit', description: 'Vendé tu primera empresa' },
    (s) => s.prestige.sales,
    1,
  ),
  counter(
    { id: 'sales3', category: 'company', icon: '🔄', name: 'Emprendedor serial', description: 'Vendé 3 empresas' },
    (s) => s.prestige.sales,
    3,
  ),
  counter(
    { id: 'sales5', category: 'company', icon: '👼', name: 'Inversor ángel', description: 'Vendé 5 empresas' },
    (s) => s.prestige.sales,
    5,
  ),
  counter(
    { id: 'sales10', category: 'company', icon: '👑', name: 'Rey de las startups', description: 'Vendé 10 empresas' },
    (s) => s.prestige.sales,
    10,
  ),

  // 🛠 Herramientas
  {
    id: 'byeNano',
    category: 'tools',
    icon: '👋',
    name: 'Adiós Nano',
    description: 'Comprá tu primer editor',
    check: ({ next }) => next.editor !== 'nano',
  },
  {
    id: 'vibeCoder',
    category: 'tools',
    icon: '✨',
    name: 'Vibe coder',
    description: 'Instalá Cladex',
    check: ({ next }) => next.editor === 'cladex',
  },
  counter(
    { id: 'polyglot', category: 'tools', icon: '🗣️', name: 'Políglota', description: 'Aprendé 8 tecnologías' },
    (s) => Object.values(s.tech).filter((l) => l > 0).length,
    8,
  ),
  counter(
    {
      id: 'stackMaster',
      category: 'tools',
      icon: '🧙',
      name: 'Maestro del stack',
      description: 'Llevá una tecnología a Nv.5',
    },
    (s) => Math.max(...Object.values(s.tech)),
    5,
  ),

  // 🎲 Suerte
  counter(
    {
      id: 'badDay',
      category: 'luck',
      icon: '🌧️',
      name: 'Hoy no es mi día',
      description: '5 eventos malos en la misma empresa',
    },
    (s) => s.stats.badEvents,
    5,
  ),
  counter(
    {
      id: 'luckyStreak',
      category: 'luck',
      icon: '🍀',
      name: 'La suerte del principiante',
      description: '3 eventos buenos seguidos',
    },
    (s) => s.records.goodStreak,
    3,
  ),
  counter(
    {
      id: 'bets5',
      category: 'luck',
      icon: '🧮',
      name: 'Todo calculado',
      description: 'Ganá 5 apuestas de los eventos',
    },
    (s) => s.records.betsWon,
    5,
  ),

  // 🎮 Minijuegos
  {
    id: 'lgtm',
    category: 'games',
    icon: '✅',
    name: 'LGTM',
    description: 'Terminá un minijuego sin errores',
    check: ({ action }) => action.type === 'minigame' && action.score >= 1,
  },
  counter(
    { id: 'seniorReviewer', category: 'games', icon: '🧐', name: 'Senior reviewer', description: 'Jugá 20 minijuegos' },
    (s) => s.records.minigames,
    20,
  ),

  // 🦄 El final
  {
    id: 'ipo',
    category: 'company',
    icon: '🦄',
    name: 'Leyenda de Silicon Valley',
    description: 'Sacá tu empresa a la bolsa',
    check: ({ next }) => next.records.ipoAt > 0,
  },

  // 🏁 Desafíos
  counter(
    { id: 'masochist', category: 'company', icon: '🏁', name: 'Masoquista', description: 'Completá un desafío de run' },
    (s) => s.records.challengesDone.length,
    1,
  ),
  counter(
    {
      id: 'professionalSuffering',
      category: 'company',
      icon: '🥵',
      name: 'Sufrimiento profesional',
      description: 'Completá todos los desafíos de run',
    },
    (s) => s.records.challengesDone.length,
    CHALLENGES.length,
  ),

  // 👥 Profesiones (G3)
  {
    id: 'internGenius',
    category: 'team',
    icon: '🎓',
    name: 'El pasante es un genio',
    description: 'Que un pasante te sorprenda',
    check: ({ prev, next, action }) => action.type === 'intern' && action.surprise && next.code > prev.code,
  },
  {
    id: 'bestLead',
    category: 'team',
    icon: '🧑‍🏫',
    name: 'Liderazgo técnico',
    description: 'Tené un Tech Lead 5★',
    check: ({ next }) => next.team.some((e) => e.role === 'lead' && e.stars >= 5),
  },

  // 👹 Jefes (G3)
  counter(
    {
      id: 'firstBoss',
      category: 'contracts',
      icon: '👹',
      name: 'Jefe de nivel',
      description: 'Vencé a un cliente jefe',
    },
    (s) => s.records.bosses,
    1,
  ),
  counter(
    {
      id: 'bosses10',
      category: 'contracts',
      icon: '🦁',
      name: 'Domador de clientes',
      description: 'Vencé a 10 clientes jefe',
    },
    (s) => s.records.bosses,
    10,
  ),
  counter(
    {
      id: 'bosses50',
      category: 'contracts',
      icon: '🫡',
      name: 'El cliente siempre tiene razón',
      description: 'Vencé a 50 clientes jefe (y no le dijiste lo que pensabas)',
    },
    (s) => s.records.bosses,
    50,
  ),

  // 🏺 Colección (G3)
  counter(
    {
      id: 'firstArtifact',
      category: 'collection',
      icon: '🪴',
      name: 'Decorando el escritorio',
      description: 'Conseguí tu primer artefacto',
    },
    artifactCount,
    1,
  ),
  counter(
    {
      id: 'artifacts8',
      category: 'collection',
      icon: '🗃️',
      name: 'Coleccionista',
      description: 'Conseguí 8 artefactos distintos',
    },
    artifactCount,
    8,
  ),
  counter(
    {
      id: 'artifactsAll',
      category: 'collection',
      icon: '🖥️',
      name: 'Setup de streamer',
      description: `Conseguí los ${ARTIFACTS.length} artefactos`,
    },
    artifactCount,
    ARTIFACTS.length,
  ),
  {
    id: 'legendary',
    category: 'collection',
    icon: '🌟',
    name: '¡Legendario!',
    description: 'Conseguí un artefacto legendario',
    check: ({ next }) => Object.keys(next.records.artifacts).some((id) => getArtifact(id)?.rarity === 'legendary'),
  },
  {
    id: 'maxArtifact',
    category: 'collection',
    icon: '🔟',
    name: 'Al máximo',
    description: `Subí un artefacto a Nv.${MAX_ARTIFACT_LEVEL}`,
    check: ({ next }) => Object.values(next.records.artifacts).some((level) => level >= MAX_ARTIFACT_LEVEL),
  },
  counter(
    {
      id: 'unboxing',
      category: 'collection',
      icon: '📦',
      name: 'Unboxing',
      description: 'Abrí 25 cajas de suministros',
    },
    boxesOpened,
    25,
  ),
  counter(
    {
      id: 'unboxing100',
      category: 'collection',
      icon: '🎥',
      name: 'Canal de unboxing',
      description: 'Abrí 100 cajas de suministros',
    },
    boxesOpened,
    100,
  ),

  // 🃏 Especializaciones (G3)
  {
    id: 'rareCard',
    category: 'collection',
    icon: '✨',
    name: 'Carta brillante',
    description: 'Elegí una carta rara',
    check: ({ next }) => next.cards.some((c) => c.rare),
  },
  {
    id: 'specialist',
    category: 'collection',
    icon: '🎯',
    name: 'Especialista',
    description: 'Juntá 4 cartas del mismo estilo en una empresa',
    check: ({ next }) => {
      const styles = cardStyles(next)
      return styles.some((style) => styles.filter((x) => x === style).length >= 4)
    },
  },
  {
    id: 'swissKnife',
    category: 'collection',
    icon: '🔪',
    name: 'Navaja suiza',
    description: 'Tené una carta de cada estilo en la misma empresa',
    check: ({ next }) => {
      const styles = cardStyles(next)
      return new Set(CARDS.map((c) => c.style)).size === new Set(styles.filter(Boolean)).size
    },
  },

  // 🏁 Desafíos e IPO (G3)
  {
    id: 'nanoOrDeath',
    category: 'company',
    icon: '🐧',
    name: 'Nano o muerte',
    description: 'Completá el desafío Nano para siempre',
    check: ({ next }) => next.records.challengesDone.includes('nanoForever'),
  },
  {
    id: 'noHands',
    category: 'company',
    icon: '🙌',
    name: 'Con los codos',
    description: 'Completá el desafío Manos atadas',
    check: ({ next }) => next.records.challengesDone.includes('tiedHands'),
  },
  {
    id: 'legendSale',
    category: 'company',
    icon: '👑',
    name: 'La leyenda continúa',
    description: 'Vendé una empresa después de salir a la bolsa',
    check: ({ prev, next }) => next.records.ipoAt > 0 && next.prestige.sales > prev.prestige.sales,
  },
  counter(
    {
      id: 'tokens100',
      category: 'company',
      icon: '🪙',
      name: 'Fondo de inversión',
      description: 'Ganá 100 tokens en toda tu carrera',
    },
    (s) => tokensEarned(s.prestige),
    100,
  ),

  // 🎲 y 🎮 (G3)
  counter(
    {
      id: 'bets20',
      category: 'luck',
      icon: '🃏',
      name: 'Contador de cartas',
      description: 'Ganá 20 apuestas de los eventos',
    },
    (s) => s.records.betsWon,
    20,
  ),
  counter(
    {
      id: 'minigames50',
      category: 'games',
      icon: '🕹️',
      name: 'Más juego que trabajo',
      description: 'Jugá 50 minijuegos',
    },
    (s) => s.records.minigames,
    50,
  ),

  // 🎨 Personalización (G4)
  counter(
    {
      id: 'petLover',
      category: 'team',
      icon: '🐾',
      name: 'Mascota feliz',
      description: 'Acariciá a la mascota de la oficina 10 veces',
    },
    (s) => s.records.pets,
    10,
  ),
  {
    id: 'freshLook',
    category: 'team',
    icon: '🧢',
    name: 'Con facha',
    description: 'Ponele un accesorio a tu avatar',
    check: ({ next }) => next.profile.head !== 'none' || next.profile.face !== 'none',
  },

  // 🔒 Secretos
  counter(
    {
      id: 'exterminator',
      category: 'secret',
      icon: '🐛',
      name: 'Exterminador',
      description: 'Atrapá 10 bugs dorados',
      secret: true,
    },
    (s) => s.records.bugs,
    10,
  ),
  {
    id: 'tampered',
    category: 'secret',
    icon: '🕵️',
    name: 'sudo give money',
    description: 'Editar la partida a mano. Las partidas trucadas saben feo',
    secret: true,
    check: ({ next }) => next.tampered,
  },
  {
    id: 'sawItFirst',
    category: 'secret',
    icon: '👀',
    name: 'Lo vi primero',
    description: 'Atrapá un bug dorado en sus primeros 2 segundos',
    secret: true,
    check: ({ action }) => action.type === 'catchBug' && action.fast === true,
  },
  {
    id: 'noSleep',
    category: 'secret',
    icon: '☕',
    name: '¿Quién necesita dormir?',
    description: 'Jugá 3 horas seguidas en la misma sesión',
    secret: true,
    check: ({ action }) => action.type === 'playTime' && (action.session ?? 0) >= 3 * 3600,
  },
]
