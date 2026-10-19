// Guardado de la partida en localStorage, con versión y validación (GDD §14).
import { EDITORS } from '../data/editors'
import { INITIAL_SKILLS } from '../data/skills'
import { INITIAL_TECH } from '../data/techs'
import type { GameState } from './reducer'

const SAVE_KEY = 'dev-clicker:save'

/** Subir este número cuando cambie la forma de GameState, y migrar los guardados viejos */
export const SAVE_VERSION: number = 7

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

function isSaveFile(value: unknown): value is SaveFile {
  if (!isObject(value) || !isNumber(value.version) || !isObject(value.state)) return false
  const s = value.state
  const skills = s.skills
  return (
    ['code', 'money', 'xp', 'rep', 'developers', 'office', 'timeLeft'].every((key) => isNumber(s[key])) &&
    isObject(skills) &&
    Object.keys(INITIAL_SKILLS).every((key) => isNumber(skills[key])) &&
    EDITORS.some((e) => e.id === s.editor) &&
    EDITORS.some((e) => e.id === s.look) &&
    isObject(s.darkMode) &&
    typeof s.dim === 'boolean' &&
    isObject(s.tech) &&
    Array.isArray(s.offers) &&
    s.offers.every(isContract) &&
    isObject(s.cooldowns) &&
    (s.contract === null || isContract(s.contract))
  )
}
