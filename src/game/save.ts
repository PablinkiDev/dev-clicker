// Guardado de la partida en localStorage, con versión y validación (GDD §14).
import { EDITORS } from '../data/editors'
import { INITIAL_SKILLS } from '../data/skills'
import { INITIAL_TECH, LANG_EXT } from '../data/techs'
import { ROLE_IDS } from '../data/roles'
import { createCandidate, createInitialCandidates, type Employee } from './team'
import { INITIAL_STATS, type GameState } from './reducer'
import { sanitize } from './sanitize'
import { INITIAL_PRESTIGE } from './prestige'
import { INITIAL_FOCUS } from './focus'
import { INITIAL_INVESTMENTS } from '../data/investments'
import { INITIAL_RECORDS } from './records'
import { INITIAL_ABILITIES } from '../data/abilities'
import { getBoss } from '../data/bosses'
import { MAX_ARTIFACT_LEVEL, getArtifact } from '../data/artifacts'
import { ACHIEVEMENTS } from '../data/achievements'
import { FEATURES, featuresFor } from '../data/features'

const SAVE_KEY = 'dev-clicker:save'

/** Si una partida no se puede cargar, se copia acá antes de que el juego la pise con una nueva */
const BACKUP_KEY = 'dev-clicker:save-backup'

/**
 * Valores por defecto de los campos que se fueron agregando. Si a una partida le falta alguno,
 * se completa en vez de descartarla. Pasa sobre todo en desarrollo: con la recarga en caliente de
 * Vite, el estado viejo en memoria se guarda con la versión nueva y quedan campos sin migrar.
 */
const FIELD_DEFAULTS: Partial<GameState> = {
  stage: 0,
  endless: 0,
  office: 0,
  dim: false,
  darkMode: { owned: false, on: false },
  autoAccept: true,
  modifiers: [],
  focus: INITIAL_FOCUS,
  abilities: INITIAL_ABILITIES,
  cards: [],
  cardOffer: null,
  combo: { count: 0, lastAt: 0 },
  bossCountdown: 10,
  stats: INITIAL_STATS,
  prestige: INITIAL_PRESTIGE,
  records: INITIAL_RECORDS,
  contractClicks: 0,
  rerolls: 0,
  macro: 0,
  macroOn: true,
  tampered: false,
}

/** Subir este número cuando cambie la forma de GameState, y migrar los guardados viejos */
export const SAVE_VERSION: number = 19

/** Desde esta versión el guardado de localStorage va firmado: un JSON plano nuevo es una edición a mano */
const SIGNED_SINCE = 19

type SaveFile = {
  version: number
  savedAt: number
  state: GameState
}

/** La partida como texto JSON, lista para guardar o exportar */
export function serializeGame(state: GameState): string {
  // La terminal y los avisos son pasajeros: no se guardan
  const file: SaveFile = { version: SAVE_VERSION, savedAt: Date.now(), state: { ...state, notice: null, log: [] } }
  return JSON.stringify(file)
}

/**
 * Lee una partida desde texto JSON (de localStorage o de un archivo importado):
 * la migra, la completa y la valida. Devuelve null si no es una partida válida.
 */
export function parseGame(raw: string): GameState | null {
  try {
    const file = migrate(JSON.parse(raw))
    if (!isSaveFile(file) || file.version !== SAVE_VERSION) return null
    const state = sanitize({ ...file.state, notice: null, log: [] })
    // Partidas de antes del revelado progresivo: todo lo que ya tenían queda visible, sin anunciarlo
    if (state.records.features === null)
      return { ...state, records: { ...state.records, features: featuresFor(state) } }
    return state
  } catch {
    return null
  }
}

// --- Exportar / importar ------------------------------------------------------
// El archivo exportado va en base64 y con una firma. No es seguridad de verdad (el juego corre
// en la compu del jugador y cualquiera puede leer este código), pero frena al que abre el archivo
// con el Bloc de notas para ponerse un millón de dólares. Y si lo hace, el juego se da cuenta.

const EXPORT_PREFIX = 'DEVCLICKER1:'
const SIGNATURE_SALT = 'cafe-ilimitado-sueno-limitado'

/** Hash rápido (cyrb53): mismo texto → misma firma; un cambio mínimo → firma totalmente distinta */
function checksum(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

/** base64 que soporta tildes y emojis (btoa solo entiende Latin-1) */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function fromBase64(base64: string): string {
  const binary = atob(base64)
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/** Texto del archivo exportado: prefijo + partida en base64 + "." + firma */
export function exportGame(state: GameState): string {
  const json = serializeGame(state)
  return `${EXPORT_PREFIX}${toBase64(json)}.${checksum(json + SIGNATURE_SALT)}`
}

/**
 * Lee un archivo exportado. tampered = la firma no coincide (o es un JSON a mano): la partida
 * se carga igual, pero el juego avisa. Devuelve null si no es una partida válida.
 */
export function importGame(text: string): { state: GameState; tampered: boolean } | null {
  const raw = text.trim()
  if (!raw.startsWith(EXPORT_PREFIX)) {
    const state = parseGame(raw) // un JSON plano: válido, pero sin firma
    return state && { state, tampered: true }
  }
  const body = raw.slice(EXPORT_PREFIX.length)
  const dot = body.lastIndexOf('.')
  try {
    const json = fromBase64(body.slice(0, dot))
    const state = parseGame(json)
    return state && { state, tampered: checksum(json + SIGNATURE_SALT) !== body.slice(dot + 1) }
  } catch {
    return null
  }
}

/**
 * Lee el guardado de localStorage. Firmado (desde la v19) o JSON plano (partidas viejas).
 * tampered = la firma no coincide, o es un JSON plano de una versión que ya debería venir firmada
 */
function readSave(raw: string): { state: GameState; tampered: boolean } | null {
  const text = raw.trim()
  if (text.startsWith(EXPORT_PREFIX)) return importGame(text)
  const state = parseGame(text)
  if (!state) return null
  const version: unknown = JSON.parse(text).version
  return { state, tampered: !isNumber(version) || version >= SIGNED_SINCE }
}

export function saveGame(state: GameState): void {
  try {
    // Mismo formato que la exportación: base64 + firma. Frena al curioso que edita localStorage
    localStorage.setItem(SAVE_KEY, exportGame(state))
  } catch {
    // Sin espacio o almacenamiento bloqueado (modo privado): el juego sigue sin guardar
  }
}

/** Devuelve la partida guardada, o null si no hay ninguna o el archivo no es válido */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const read = readSave(raw)
    if (!read) {
      backup(raw)
      return null
    }
    const { state, tampered } = read
    // Una partida editada no se borra (un bug nuestro podría parecer una edición): se marca para siempre
    const newlyTampered = tampered && !state.tampered
    return {
      ...state,
      tampered: state.tampered || tampered,
      notice: newlyTampered
        ? {
            kind: 'error',
            text: 'git blame: detectamos cambios sin commitear en esta partida 👀 Te la cargamos igual.',
          }
        : null,
      log: [{ id: 1, kind: 'info', text: 'Partida cargada. ¡Bienvenido de vuelta!' }],
    }
  } catch {
    backup(localStorage.getItem(SAVE_KEY))
    return null
  }
}

/** Guarda una copia de la partida que no se pudo cargar (para revisarla o recuperarla a mano) */
function backup(raw: string | null): void {
  if (!raw) return
  try {
    localStorage.setItem(BACKUP_KEY, raw)
    console.warn(`No se pudo cargar la partida. Hay una copia en localStorage["${BACKUP_KEY}"].`)
  } catch {
    // sin espacio: no hay nada más que hacer
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // nada que borrar
  }
}

// --- Migraciones -------------------------------------------------------------
// Cada vez que cambia la forma del estado, un guardado viejo se actualiza paso a paso.

function migrate(raw: unknown): unknown {
  if (!isObject(raw) || !isObject(raw.state)) return raw
  let file: Record<string, unknown> = raw
  let state: Record<string, unknown> = raw.state

  // v1 → v2: el nivel de "Escritura veloz" pasó a vivir dentro de skills
  if (file.version === 1) {
    const { fastTypingLevel, ...rest } = state
    state = { ...rest, skills: { ...INITIAL_SKILLS, fastTyping: isNumber(fastTypingLevel) ? fastTypingLevel : 0 } }
    file = { ...file, version: 2 }
  }

  // v2 → v3: aparecen los editores; las partidas viejas arrancan en Nano
  if (file.version === 2) {
    state = { ...state, editor: 'nano' }
    file = { ...file, version: 3 }
  }

  // v3 → v4: se puede elegir el aspecto; arranca igual al editor comprado
  if (file.version === 3) {
    state = { ...state, look: state.editor }
    file = { ...file, version: 4 }
  }

  // v4 → v5: modo oscuro y reducir brillo
  if (file.version === 4) {
    state = { ...state, darkMode: { owned: false, on: false }, dim: false }
    file = { ...file, version: 5 }
  }

  // v5 → v6: tecnologías; se arranca sabiendo HTML y CSS
  if (file.version === 5) {
    state = { ...state, tech: INITIAL_TECH }
    file = { ...file, version: 6 }
  }

  // v6 → v7: oficinas; todos arrancan en la habitación
  if (file.version === 6) {
    state = { ...state, office: 0 }
    file = { ...file, version: 7 }
  }

  // v7 → v8: los desarrolladores pasan a ser personas con nombre y estrellas (todos 1★)
  if (file.version === 7) {
    const { developers, ...rest } = state
    const team: Employee[] = []
    const count = isNumber(developers) ? developers : 0
    for (let i = 0; i < count; i++) team.push(createCandidate('dev', team, 0, 1))
    state = { ...rest, team, candidates: createInitialCandidates(team) }
    file = { ...file, version: 8 }
  }

  // v8 → v9: estadísticas. No sabemos cuánto se ganó antes: como mínimo, lo que hay en mano
  if (file.version === 8) {
    state = { ...state, stats: { ...INITIAL_STATS, moneyEarned: isNumber(state.money) ? state.money : 0 } }
    file = { ...file, version: 9 }
  }

  // v9 → v10: etapas; todos arrancan como Freelancer
  if (file.version === 9) {
    state = { ...state, stage: 0 }
    file = { ...file, version: 10 }
  }

  // v10 → v11: modo infinito
  if (file.version === 10) {
    state = { ...state, endless: 0 }
    file = { ...file, version: 11 }
  }

  // v11 → v12: prestigio (venta de la empresa)
  if (file.version === 11) {
    state = { ...state, prestige: INITIAL_PRESTIGE }
    file = { ...file, version: 12 }
  }

  // v12 → v13: árbol de prestigio
  if (file.version === 12 && isObject(state.prestige)) {
    state = { ...state, prestige: { ...state.prestige, investments: INITIAL_INVESTMENTS } }
    file = { ...file, version: 13 }
  }

  // v13 → v14: historial de empresas vendidas
  if (file.version === 13 && isObject(state.prestige)) {
    state = { ...state, prestige: { ...state.prestige, history: [] } }
    file = { ...file, version: 14 }
  }

  // v14 → v15: TypeScript, React y Node.js (sin aprender)
  if (file.version === 14 && isObject(state.tech)) {
    state = { ...state, tech: { ...INITIAL_TECH, ...state.tech } }
    file = { ...file, version: 15 }
  }

  // v15 → v16: interruptor de la Captación automática
  if (file.version === 15) {
    state = { ...state, autoAccept: true }
    file = { ...file, version: 16 }
  }

  // v16 → v17: Concentración
  if (file.version === 16) {
    state = { ...state, focus: INITIAL_FOCUS }
    file = { ...file, version: 17 }
  }

  // v17 → v18: logros y récords (arrancan en cero; los defaults los completan abajo)
  if (file.version === 17) {
    file = { ...file, version: 18 }
  }

  // v18 → v19: el guardado se firma; las partidas existentes arrancan sin marca de edición
  if (file.version === 18) {
    file = { ...file, version: 19 }
  }

  // Siempre: completar claves nuevas que falten o que vengan rotas (por ejemplo, una partida guardada
  // con la versión nueva pero con datos viejos en memoria, como pasa con la recarga en caliente de Vite:
  // un campo que no existía termina como NaN, y JSON lo guarda como null)
  state = { ...FIELD_DEFAULTS, ...state }
  if (isObject(state.tech)) state = { ...state, tech: fixNumbers(INITIAL_TECH, state.tech) }
  if (isObject(state.stats)) state = { ...state, stats: fixNumbers(INITIAL_STATS, state.stats) }
  if (isObject(state.skills)) state = { ...state, skills: fixNumbers(INITIAL_SKILLS, state.skills) }
  if (isObject(state.focus)) state = { ...state, focus: fixNumbers(INITIAL_FOCUS, state.focus) }
  if (isObject(state.abilities)) {
    const abilities = state.abilities
    state = {
      ...state,
      abilities: Object.fromEntries(
        Object.entries(INITIAL_ABILITIES).map(([id, initial]) => {
          const timer = abilities[id]
          return [id, isObject(timer) ? fixNumbers(initial, timer) : initial]
        }),
      ),
    }
  }
  if (isObject(state.records)) {
    const records = state.records
    const known = new Set(ACHIEVEMENTS.map((a) => a.id))
    state = {
      ...state,
      records: {
        ...fixNumbers(INITIAL_RECORDS, records),
        // Solo logros que existen, sin repetir
        unlocked: Array.isArray(records.unlocked)
          ? [...new Set(records.unlocked.filter((id): id is string => typeof id === 'string' && known.has(id)))]
          : [],
        recentCrits: Array.isArray(records.recentCrits) ? records.recentCrits.filter(isNumber).slice(-20) : [],
        // Solo artefactos que existen, con niveles de 1 a 10
        artifacts: isObject(records.artifacts)
          ? Object.fromEntries(
              Object.entries(records.artifacts)
                .filter(([id, level]) => getArtifact(id) && isNumber(level) && level >= 1)
                .map(([id, level]) => [id, Math.min(MAX_ARTIFACT_LEVEL, Math.round(level as number))]),
            )
          : {},
        // null = partida de antes del revelado progresivo: se calcula al final (sin anunciar nada)
        features: Array.isArray(records.features)
          ? records.features.filter((id): id is string => FEATURES.some((f) => f.id === id))
          : null,
      },
    }
  }
  if (isObject(state.prestige) && isObject(state.prestige.investments)) {
    state = {
      ...state,
      prestige: {
        ...INITIAL_PRESTIGE,
        ...state.prestige,
        investments: fixNumbers(INITIAL_INVESTMENTS, state.prestige.investments),
      },
    }
  }

  return { ...file, state }
}

/** Toma cada número de `value`; si falta o no es un número válido (null, NaN, texto), usa el de `defaults` */
function fixNumbers<T extends object>(defaults: T, value: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...value }
  for (const [key, fallback] of Object.entries(defaults)) {
    if (!isNumber(value[key])) result[key] = fallback
  }
  return result as T
}

// --- Validación -------------------------------------------------------------
// JSON.parse devuelve "cualquier cosa": un guardado editado a mano o de otra versión
// podría romper el juego. Estas funciones revisan la forma antes de confiar en el dato.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** ¿Es un objeto con un número en cada clave del modelo? (niveles de tecnologías, etc.) */
function hasNumbers(value: unknown, model: object): boolean {
  return isObject(value) && Object.keys(model).every((key) => isNumber(value[key]))
}

function isContract(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.uid === 'string' &&
    typeof value.id === 'string' &&
    isNumber(value.code) &&
    isNumber(value.time) &&
    isObject(value.reward) &&
    // El lenguaje y el stack tienen que existir en el juego (si no, la interfaz no sabe dibujarlos)
    (value.lang === undefined || (typeof value.lang === 'string' && value.lang in LANG_EXT)) &&
    (value.special === undefined ||
      value.special === 'clicksOnly' ||
      value.special === 'rush' ||
      value.special === 'giant') &&
    (value.boss === undefined || (typeof value.boss === 'string' && getBoss(value.boss) !== undefined)) &&
    (value.stack === undefined ||
      (Array.isArray(value.stack) && value.stack.every((id) => typeof id === 'string' && id in INITIAL_TECH)))
  )
}

function isEmployee(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.uid === 'string' &&
    ROLE_IDS.some((r) => r === value.role) &&
    isNumber(value.stars) &&
    typeof value.name === 'string' &&
    typeof value.quirk === 'string'
  )
}

function isStats(value: unknown): boolean {
  return isObject(value) && Object.keys(INITIAL_STATS).every((key) => isNumber(value[key]))
}

function isPrestige(value: unknown): boolean {
  if (!isObject(value) || !isNumber(value.tokens) || !isNumber(value.sales)) return false
  const investments = value.investments
  return (
    isObject(investments) &&
    Object.keys(INITIAL_INVESTMENTS).every((key) => isNumber(investments[key])) &&
    Array.isArray(value.history) &&
    value.history.every((sale) => isObject(sale) && isNumber(sale.soldAt) && isNumber(sale.value))
  )
}

function isSaveFile(value: unknown): value is SaveFile {
  if (!isObject(value) || !isNumber(value.version) || !isObject(value.state)) return false
  const s = value.state
  const skills = s.skills
  return (
    ['code', 'money', 'xp', 'rep', 'stage', 'endless', 'office', 'timeLeft'].every((key) => isNumber(s[key])) &&
    isObject(skills) &&
    Object.keys(INITIAL_SKILLS).every((key) => isNumber(skills[key])) &&
    EDITORS.some((e) => e.id === s.editor) &&
    EDITORS.some((e) => e.id === s.look) &&
    isObject(s.darkMode) &&
    typeof s.dim === 'boolean' &&
    typeof s.autoAccept === 'boolean' &&
    Array.isArray(s.modifiers) &&
    s.modifiers.every(
      (m) => isObject(m) && isNumber(m.mult) && isNumber(m.endsAt) && (m.target === 'auto' || m.target === 'click'),
    ) &&
    hasNumbers(s.focus, INITIAL_FOCUS) &&
    hasNumbers(s.tech, INITIAL_TECH) &&
    isStats(s.stats) &&
    isPrestige(s.prestige) &&
    isNumber(s.contractClicks) &&
    isObject(s.records) &&
    Array.isArray(s.team) &&
    s.team.every(isEmployee) &&
    Array.isArray(s.candidates) &&
    s.candidates.every(isEmployee) &&
    Array.isArray(s.offers) &&
    s.offers.every(isContract) &&
    isObject(s.cooldowns) &&
    (s.contract === null || isContract(s.contract))
  )
}
