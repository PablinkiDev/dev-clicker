// Guardado de la partida en localStorage, con versión y validación (GDD §14).
import { EDITORS } from '../data/editors'
import { INITIAL_SKILLS } from '../data/skills'
import { INITIAL_TECH } from '../data/techs'
import { ROLE_IDS } from '../data/roles'
import { createCandidate, createInitialCandidates, type Employee } from './team'
import { INITIAL_STATS, type GameState } from './reducer'
import { INITIAL_PRESTIGE } from './prestige'
import { INITIAL_INVESTMENTS } from '../data/investments'

const SAVE_KEY = 'dev-clicker:save'

/** Subir este número cuando cambie la forma de GameState, y migrar los guardados viejos */
export const SAVE_VERSION: number = 15

type SaveFile = {
  version: number
  savedAt: number
  state: GameState
}

export function saveGame(state: GameState): void {
  // La terminal y los avisos son pasajeros: no se guardan
  const file: SaveFile = { version: SAVE_VERSION, savedAt: Date.now(), state: { ...state, notice: null, log: [] } }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(file))
  } catch {
    // Sin espacio o almacenamiento bloqueado (modo privado): el juego sigue sin guardar
  }
}

/** Devuelve la partida guardada, o null si no hay ninguna o el archivo no es válido */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const file = migrate(JSON.parse(raw))
    if (!isSaveFile(file) || file.version !== SAVE_VERSION) return null
    return {
      ...file.state,
      notice: null,
      log: [{ id: 1, kind: 'info', text: 'Partida cargada. ¡Bienvenido de vuelta!' }],
    }
  } catch {
    return null
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

  // Siempre: completar claves nuevas que falten (por ejemplo, una partida guardada con la versión
  // nueva pero con datos viejos en memoria, como pasa con la recarga en caliente de Vite)
  if (isObject(state.tech)) state = { ...state, tech: { ...INITIAL_TECH, ...state.tech } }
  if (isObject(state.skills)) state = { ...state, skills: { ...INITIAL_SKILLS, ...state.skills } }
  if (isObject(state.prestige) && isObject(state.prestige.investments)) {
    state = {
      ...state,
      prestige: { ...state.prestige, investments: { ...INITIAL_INVESTMENTS, ...state.prestige.investments } },
    }
  }

  return { ...file, state }
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
    isObject(value.reward)
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
    hasNumbers(s.tech, INITIAL_TECH) &&
    isStats(s.stats) &&
    isPrestige(s.prestige) &&
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
