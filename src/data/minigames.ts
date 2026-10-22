// Minijuegos (D9): cada tanto llega una invitación opcional. Si jugás, según cómo te fue,
// el equipo produce más por un rato y ganás XP. Si te va mal, no pasa nada malo.

export type MinigameId = 'review' | 'merge' | 'typing' | 'whack' | 'cables' | 'deploy' | 'memory' | 'simon'

export type MinigameInfo = {
  id: MinigameId
  icon: string
  title: string
  invite: string
  rules: string
  /** 🧑‍💻 Hace falta saber algo de programación (G2: el resto se juega sin saber nada) */
  forDevs?: boolean
}

export const MINIGAMES: MinigameInfo[] = [
  {
    id: 'review',
    icon: '🔍',
    title: 'Code review',
    invite: '“¿Me revisás este PR? Es cortito, lo juro.”',
    rules: 'Tocá la línea que tiene el bug. 3 rondas, cada una más rápida.',
    forDevs: true,
  },
  {
    id: 'merge',
    icon: '🔀',
    title: 'Merge conflict',
    invite: '“Git dice que hay conflictos. Yo no toqué nada.”',
    rules: 'Leé el ticket y quedate con la versión correcta. 3 conflictos.',
    forDevs: true,
  },
  {
    id: 'typing',
    icon: '⌨️',
    title: 'Typing race',
    invite: '“Producción se cayó. ¡Rápido, escribí el comando!”',
    rules: 'Escribí 3 comandos exactos antes de que se acabe el tiempo.',
    forDevs: true,
  },
  // 🎮 Para no programadores (G2)
  {
    id: 'whack',
    icon: '🐛',
    title: 'Aplastá bugs',
    invite: '“Se escaparon los bugs del sprint. ¡Agarralos!”',
    rules: 'Tocá los bugs antes de que se escondan. Al patito no: él te ayuda a pensar.',
  },
  {
    id: 'cables',
    icon: '🔌',
    title: 'Conectá los servidores',
    invite: '“Alguien desenchufó el rack para cargar el celular.”',
    rules: 'Tocá un servidor y después el enchufe de su mismo color. 3 racks.',
  },
  {
    id: 'deploy',
    icon: '📦',
    title: 'Ordená el deploy',
    invite: '“¿Cómo era el orden? ¿Primero deploy y después tests?”',
    rules: 'Tocá los pasos en el orden correcto. Un error y se cae ese deploy. 3 deploys.',
  },
  {
    id: 'memory',
    icon: '🧠',
    title: 'Memoria de logos',
    invite: '“¿Cuántas tecnologías usamos? Ni idea, pero son pares.”',
    rules: 'Encontrá los 6 pares de logos. Cuantos menos errores, mejor.',
  },
  {
    id: 'simon',
    icon: '💡',
    title: 'Simón dice del servidor',
    invite: '“El servidor parpadea en código. Repetilo para reiniciarlo.”',
    rules: 'Mirá la secuencia de luces y repetila. 3 secuencias, cada una más larga.',
  },
]

// --- Tiempos ------------------------------------------------------------------------
// Para probar los minijuegos, bajá MINIGAME_MIN_DELAY y MINIGAME_EXTRA_DELAY (por ejemplo a 10 y 0)
// y MINIGAME_FIRST_AT a 0.

/** Espera mínima entre invitaciones (segundos) */
export const MINIGAME_MIN_DELAY = 360
/** Espera extra al azar, entre 0 y esto (segundos): en total, de 6 a 10 minutos */
export const MINIGAME_EXTRA_DELAY = 240
/** Segundos de juego antes de la primera invitación (para no tapar el arranque) */
export const MINIGAME_FIRST_AT = 300
/** Cuánto dura la invitación en pantalla antes de irse sola (segundos) */
export const MINIGAME_INVITE_SECONDS = 20

export function nextMinigameDelay(): number {
  return (MINIGAME_MIN_DELAY + Math.random() * MINIGAME_EXTRA_DELAY) * 1000
}

// --- Premio ---------------------------------------------------------------------------

/** Cuánto dura el premio de producción (segundos) */
export const MINIGAME_REWARD_SECONDS = 60

/** Premio según el puntaje (0 a 1): multiplicador del equipo y XP en "contratos" */
export function minigameReward(score: number): { mult: number; xp: number } | null {
  if (score <= 0) return null
  if (score >= 1) return { mult: 3, xp: 1 }
  if (score >= 0.6) return { mult: 2, xp: 0.6 }
  return { mult: 1.5, xp: 0.3 }
}

// --- Code review ------------------------------------------------------------------------

export type ReviewRound = { lines: string[]; bug: number; why: string }

export const REVIEW_ROUNDS: ReviewRound[] = [
  {
    lines: ['function suma(a, b) {', '  const total = a + b', '  return totl', '}'],
    bug: 2,
    why: 'totl no existe: es total',
  },
  {
    lines: ['const edad = 17', 'if (edad = 18) {', "  console.log('Es mayor')", '}'],
    bug: 1,
    why: '= asigna; para comparar va ===',
  },
  {
    lines: ['const items = [1, 2, 3]', 'for (let i = 0; i <= items.length; i++) {', '  console.log(items[i])', '}'],
    bug: 1,
    why: '<= se pasa por uno: va <',
  },
  {
    lines: [
      'async function cargar() {',
      "  const res = fetch('/api/user')",
      '  const data = await res.json()',
      '  return data',
      '}',
    ],
    bug: 1,
    why: 'Falta await antes de fetch',
  },
  {
    lines: [
      'const user = { name: "Ana" }',
      'const copia = user',
      'copia.name = "Beto"',
      'console.log(user.name) // "Ana"',
    ],
    bug: 1,
    why: 'No copia: es el mismo objeto ({ ...user })',
  },
  {
    lines: [
      'function Contador() {',
      '  let count = 0',
      '  return <button onClick={() => count++}>',
      '    {count}</button>',
      '}',
    ],
    bug: 1,
    why: 'Sin useState, React no se entera del cambio',
  },
  {
    lines: ['const precios = [10, 20, 30]', 'const total = precios.map((p) => p + 0)', 'console.log(total) // 60'],
    bug: 1,
    why: 'map no suma: va reduce',
  },
  {
    lines: ['SELECT nombre, email', 'FROM usuarios', "WHERE pais = 'AR'", 'ORDER BY nombre;', 'DELETE FROM usuarios;'],
    bug: 4,
    why: '¿Quién dejó un DELETE sin WHERE?',
  },
  {
    lines: ['const nums = [10, 1, 5]', 'nums.sort()', 'console.log(nums) // [1, 5, 10]'],
    bug: 1,
    why: 'sort() ordena como texto: [1, 10, 5]',
  },
  {
    lines: ['useEffect(() => {', '  const id = setInterval(tick, 1000)', '}, [])'],
    bug: 1,
    why: 'Falta limpiar: return () => clearInterval(id)',
  },
]

/** Segundos para cada ronda: cada vez menos */
export const REVIEW_SECONDS = [12, 9, 6]

// --- Merge conflict -------------------------------------------------------------------

export type MergeConflict = { ticket: string; head: string[]; feature: string[]; correct: 'head' | 'feature' }

export const MERGE_CONFLICTS: MergeConflict[] = [
  {
    ticket: 'El botón tiene que decir "Comprar ahora"',
    head: ['<button>Comprar</button>'],
    feature: ['<button>Comprar ahora</button>'],
    correct: 'feature',
  },
  {
    ticket: 'El descuento máximo es del 20 %',
    head: ['const MAX_DESCUENTO = 0.2'],
    feature: ['const MAX_DESCUENTO = 2'],
    correct: 'head',
  },
  {
    ticket: 'Que el header sea azul (#1e40af)',
    head: ['header { background: #1e40af; }'],
    feature: ['header { background: #b91c1c; }'],
    correct: 'head',
  },
  {
    ticket: 'Validar que el email tenga @',
    head: ['if (email.length > 0) guardar()'],
    feature: ["if (email.includes('@')) guardar()"],
    correct: 'feature',
  },
  {
    ticket: 'Mostrar 10 productos por página',
    head: ['const POR_PAGINA = 10'],
    feature: ['const POR_PAGINA = 100 // para probar'],
    correct: 'head',
  },
  {
    ticket: 'Pasar la API a HTTPS',
    head: ["const API = 'http://api.tienda.com'"],
    feature: ["const API = 'https://api.tienda.com'"],
    correct: 'feature',
  },
  {
    ticket: 'Sacar los console.log antes de producción',
    head: ['guardarPedido(pedido)'],
    feature: ["console.log('aca llega??', pedido)", 'guardarPedido(pedido)'],
    correct: 'head',
  },
  {
    ticket: 'El saludo tiene que usar el nombre del usuario',
    head: ['<h1>Hola, usuario</h1>'],
    feature: ['<h1>Hola, {user.name}</h1>'],
    correct: 'feature',
  },
  {
    ticket: 'La contraseña no se guarda en texto plano',
    head: ['db.save({ email, password })'],
    feature: ['db.save({ email, password: hash(password) })'],
    correct: 'feature',
  },
]

/** Segundos para resolver los 3 conflictos */
export const MERGE_SECONDS = 30

// --- Typing race --------------------------------------------------------------------

export const TYPING_COMMANDS: string[] = [
  'git push origin main',
  'npm run build',
  'git commit -m "fix"',
  'npm install react',
  'git checkout -b hotfix',
  'docker compose up -d',
  'git pull --rebase',
  'npm run dev',
  'git stash pop',
  'git reset --hard HEAD',
]

/** Segundos para escribir los 3 comandos */
export const TYPING_SECONDS = 25

/** Elige n elementos distintos al azar */
export function pickSome<T>(items: T[], n: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, n)
}

// --- 🐛 Aplastá bugs --------------------------------------------------------------------

/** Segundos de juego */
export const WHACK_SECONDS = 20
/** Cada cuánto asoma algo (ms): baja con el tiempo, de esto hasta la mitad */
export const WHACK_SPAWN_MS = 650
/** Cuánto se queda asomado (ms) */
export const WHACK_VISIBLE_MS = 1100
/** Probabilidad de que asome el patito en vez de un bug */
export const WHACK_DUCK_CHANCE = 0.15
/** Bugs aplastados para 1, 2 y 3 aciertos */
export const WHACK_GOALS = [5, 10, 15]

// --- 🔌 Conectá los servidores ------------------------------------------------------------

/** Colores de los cables (clases completas para Tailwind) */
export const CABLE_COLORS = [
  { id: 'green', bg: 'bg-green', stroke: '#5af78e' },
  { id: 'yellow', bg: 'bg-yellow', stroke: '#ffcb6b' },
  { id: 'purple', bg: 'bg-purple', stroke: '#c792ea' },
  { id: 'cyan', bg: 'bg-cyan', stroke: '#89ddff' },
  { id: 'red', bg: 'bg-red', stroke: '#ff6e7f' },
]
/** Cables en cada rack: 3, 4 y 5 */
export const CABLE_ROUNDS = [3, 4, 5]
/** Segundos para los 3 racks */
export const CABLE_SECONDS = 30

// --- 📦 Ordená el deploy ----------------------------------------------------------------

/** Cada pipeline, en el orden correcto */
export const DEPLOY_PIPELINES: string[][] = [
  ['📝 Escribir el código', '🧪 Correr los tests', '🏗️ Hacer el build', '🚀 Deploy'],
  ['☕ Hacer café', '📥 git pull', '💻 Programar', '📤 git push'],
  ['🎫 Leer el ticket', '💻 Programar', '👀 Code review', '🔀 Merge', '🚀 Deploy'],
  ['🐛 Reproducir el bug', '🔍 Encontrar la causa', '🩹 Arreglarlo', '🧪 Probar que no volvió'],
  ['💡 Tener una idea', '✏️ Dibujar la pantalla', '💻 Programarla', '🙋 Mostrársela al cliente', '😱 Cambiar todo'],
  ['🌿 Crear una rama', '💻 Hacer los cambios', '✅ Commit', '📤 Push', '🙏 Abrir el pull request'],
  ['📦 npm install', '🏗️ npm run build', '🧪 npm test', '🚀 Publicar'],
  ['🔥 Se cae producción', '📟 Suena el pager', '🧯 Rollback', '📝 Escribir el postmortem'],
]
/** Segundos para los 3 deploys */
export const DEPLOY_SECONDS = 30

// --- 🧠 Memoria de logos ------------------------------------------------------------------

/** Logos (con su nombre, para el que no los conoce) */
export const MEMORY_LOGOS: { icon: string; name: string }[] = [
  { icon: '🐍', name: 'Python' },
  { icon: '☕', name: 'Java' },
  { icon: '⚛️', name: 'React' },
  { icon: '🐳', name: 'Docker' },
  { icon: '🦀', name: 'Rust' },
  { icon: '🐘', name: 'PHP' },
  { icon: '🐧', name: 'Linux' },
  { icon: '💎', name: 'Ruby' },
  { icon: '🐹', name: 'Go' },
  { icon: '🍃', name: 'MongoDB' },
]
/** Pares en el tablero */
export const MEMORY_PAIRS = 6
/** Segundos para encontrarlos */
export const MEMORY_SECONDS = 45
/** Errores permitidos para 3 y 2 aciertos (si encontrás todos) */
export const MEMORY_MISSES = [4, 8]

// --- 💡 Simón dice --------------------------------------------------------------------------

/** Largo de cada secuencia */
export const SIMON_LENGTHS = [3, 5, 7]
/** Cuánto se prende cada luz al mostrar la secuencia (ms) */
export const SIMON_FLASH_MS = 500
/** Segundos para repetir cada secuencia (desde que termina de mostrarse) */
export const SIMON_SECONDS = 10
