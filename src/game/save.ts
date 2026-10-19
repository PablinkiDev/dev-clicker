// Guardado de la partida en localStorage, con versión y validación (GDD §14).
import { INITIAL_SKILLS } from '../data/skills'
import type { GameState } from './reducer'

const SAVE_KEY = 'dev-clicker:save'

/** Subir este número cuando cambie la forma de GameState, y migrar los guardados viejos */
export const SAVE_VERSION: number = 2

type SaveFile = {
  version: number
  savedAt: number
  state: GameState
}

export function saveGame(state: GameState): void {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: Date.now(), state: { ...state, notice: null } }
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
    return file.state
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

function migrate(file: unknown): unknown {
  if (!isObject(file) || !isObject(file.state)) return file

  // v1 → v2: el nivel de "Escritura veloz" pasó a vivir dentro de skills
  if (file.version === 1) {
    const { fastTypingLevel, ...rest } = file.state
    file = {
      ...file,
      version: 2,
      state: { ...rest, skills: { ...INITIAL_SKILLS, fastTyping: isNumber(fastTypingLevel) ? fastTypingLevel : 0 } },
    }
  }

  return file
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
    ['code', 'money', 'xp', 'rep', 'developers', 'timeLeft'].every((key) => isNumber(s[key])) &&
    isObject(skills) &&
    Object.keys(INITIAL_SKILLS).every((key) => isNumber(skills[key])) &&
    Array.isArray(s.offers) &&
    s.offers.every(isContract) &&
    isObject(s.cooldowns) &&
    (s.contract === null || isContract(s.contract))
  )
}
