// Tests del guardado (C12): que ninguna partida se pierda ni se rompa al cambiar de versión.
import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from './reducer'
import { SAVE_VERSION, exportGame, importGame, loadGame, parseGame, saveGame, serializeGame } from './save'

/** localStorage de mentira (los tests corren en Node, sin navegador) */
function fakeStorage() {
  const data = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  } as Storage
  return data
}

const SAVE_KEY = 'dev-clicker:save'

/** Copia de un objeto sin algunas claves (para simular partidas viejas, de antes de que existieran) */
function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy: Partial<T> = { ...obj }
  for (const key of keys) delete copy[key]
  return copy as Omit<T, K>
}

/** Una partida con progreso, para que los tests no prueben solo el estado vacío */
function played(): GameState {
  const s = createInitialState()
  return { ...s, money: 12345, xp: 678, stage: 2, office: 1, stats: { ...s.stats, contractsDone: 42 } }
}

describe('serializar y leer', () => {
  it('ida y vuelta conserva la partida', () => {
    const state = played()
    const loaded = parseGame(serializeGame(state))
    expect(loaded?.money).toBe(12345)
    expect(loaded?.stage).toBe(2)
    expect(loaded?.stats.contractsDone).toBe(42)
  })

  it('no guarda la terminal ni los avisos', () => {
    const loaded = parseGame(serializeGame({ ...played(), notice: { kind: 'success', text: 'hola' } }))
    expect(loaded?.notice).toBeNull()
    expect(loaded?.log).toEqual([])
  })

  it('rechaza basura sin romperse', () => {
    expect(parseGame('no soy json')).toBeNull()
    expect(parseGame('{"version": 3}')).toBeNull()
    expect(parseGame('null')).toBeNull()
  })
})

describe('reparaciones', () => {
  it('completa campos que faltan (partidas guardadas a medias)', () => {
    const old = omit(played(), ['records', 'macro', 'tampered'])
    const loaded = parseGame(JSON.stringify({ version: SAVE_VERSION, savedAt: 0, state: old }))
    expect(loaded).not.toBeNull()
    expect(loaded?.records.unlocked).toEqual([])
    expect(loaded?.macro).toBe(0)
    expect(loaded?.tampered).toBe(false)
  })

  it('arregla números null o NaN (el bug que borró una partida)', () => {
    const state = played()
    const json = JSON.stringify({
      version: SAVE_VERSION,
      savedAt: 0,
      state: { ...state, stats: { ...state.stats, specialsDone: null }, tech: { ...state.tech, react: null } },
    })
    const loaded = parseGame(json)
    expect(loaded?.stats.specialsDone).toBe(0)
    expect(loaded?.tech.react).toBe(0)
  })

  it('recorta valores absurdos', () => {
    const state = played()
    const json = JSON.stringify({
      version: SAVE_VERSION,
      savedAt: 0,
      state: { ...state, money: -50, stage: 99, tech: { ...state.tech, javascript: 999 } },
    })
    const loaded = parseGame(json)
    expect(loaded?.money).toBe(0)
    expect(loaded?.stage).toBe(4)
    expect(loaded?.tech.javascript).toBe(5)
  })

  it('migra una partida de la v17 (antes de logros, macro y firma)', () => {
    const rest = omit(played(), ['records', 'contractClicks', 'rerolls', 'macro', 'macroOn', 'tampered'])
    const stats = omit(rest.stats, ['badEvents'])
    const loaded = parseGame(JSON.stringify({ version: 17, savedAt: 0, state: { ...rest, stats } }))
    expect(loaded?.money).toBe(12345)
    expect(loaded?.stats.badEvents).toBe(0)
    expect(loaded?.records.clicks).toBe(0)
  })
})

describe('exportar e importar', () => {
  it('un archivo exportado se importa sin marca de edición', () => {
    const imported = importGame(exportGame(played()))
    expect(imported?.tampered).toBe(false)
    expect(imported?.state.money).toBe(12345)
  })

  it('detecta un archivo editado', () => {
    const text = exportGame(played())
    const [body, signature] = text.slice('DEVCLICKER1:'.length).split('.')
    const json = new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0)))
    const edited = json.replace('"money":12345', '"money":99999999')
    const bytes = new TextEncoder().encode(edited)
    const b64 = btoa(String.fromCharCode(...bytes))
    const imported = importGame(`DEVCLICKER1:${b64}.${signature}`)
    expect(imported?.tampered).toBe(true)
    expect(imported?.state.money).toBe(99999999) // se carga igual: marcada, no borrada
  })

  it('un JSON plano importado cuenta como editado', () => {
    expect(importGame(serializeGame(played()))?.tampered).toBe(true)
  })
})

describe('localStorage firmado', () => {
  beforeEach(() => {
    fakeStorage()
  })

  it('guarda firmado y carga sin marca', () => {
    saveGame(played())
    expect(localStorage.getItem(SAVE_KEY)?.startsWith('DEVCLICKER1:')).toBe(true)
    const loaded = loadGame()
    expect(loaded?.money).toBe(12345)
    expect(loaded?.tampered).toBe(false)
  })

  it('una partida vieja en JSON plano (v18) carga sin marca', () => {
    const json = serializeGame(played()).replace(`"version":${SAVE_VERSION}`, '"version":18')
    localStorage.setItem(SAVE_KEY, json)
    expect(loadGame()?.tampered).toBe(false)
  })

  it('un JSON plano de la versión nueva es una edición: se marca, no se borra', () => {
    localStorage.setItem(SAVE_KEY, serializeGame(played()))
    const loaded = loadGame()
    expect(loaded?.tampered).toBe(true)
    expect(loaded?.money).toBe(12345)
    expect(loaded?.notice?.kind).toBe('error')
  })

  it('si la partida no se puede leer, guarda una copia antes de perderla', () => {
    localStorage.setItem(SAVE_KEY, '{ esto está roto')
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem('dev-clicker:save-backup')).toBe('{ esto está roto')
  })
})
