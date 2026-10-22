// 🆕 H4: qué es nuevo. Cada cosa que se puede desbloquear tiene una clave ("tech:react", "role:ux");
// las que ya están disponibles pero todavía no viste llevan la etiqueta "¡Nuevo!".
import { INVESTMENTS } from '../data/investments'
import { FACE_ITEMS, HEAD_ITEMS, HOODIES, TITLES, isUnlocked } from '../data/personalization'
import { rolesFor } from '../data/roles'
import { SKILLS, missingSkillRequirements } from '../data/skills'
import { TECHS, missingRequirements } from '../data/techs'
import type { GameState } from './reducer'

/** Dónde se ve cada cosa nueva (para marcarla como vista al salir de esa pantalla o pestaña) */
export type NewsPlace = 'tech' | 'personal' | 'company' | 'prestige' | 'team' | 'profile'

/** Todo lo que está disponible ahora, agrupado por dónde se ve */
export function availableKeys(state: GameState): Record<NewsPlace, string[]> {
  const unlocked = state.records.unlocked
  return {
    tech: TECHS.filter((t) => !missingRequirements(t, state.tech, state.stage)).map((t) => `tech:${t.id}`),
    personal: SKILLS.filter(
      (s) => s.group === 'personal' && !missingSkillRequirements(s, state.skills, state.stage),
    ).map((s) => `skill:${s.id}`),
    company: SKILLS.filter((s) => s.group === 'company' && !missingSkillRequirements(s, state.skills, state.stage)).map(
      (s) => `skill:${s.id}`,
    ),
    prestige:
      state.prestige.sales > 0
        ? INVESTMENTS.filter((i) => !i.requires || state.prestige.investments[i.requires] > 0).map((i) => `inv:${i.id}`)
        : [],
    team: rolesFor(state.stage).map((r) => `role:${r}`),
    profile: [
      ...HOODIES.filter((c) => c.unlock && isUnlocked(c, unlocked)).map((c) => `look:hoodie:${c.id}`),
      ...HEAD_ITEMS.filter((c) => c.unlock && isUnlocked(c, unlocked)).map((c) => `look:head:${c.id}`),
      ...FACE_ITEMS.filter((c) => c.unlock && isUnlocked(c, unlocked)).map((c) => `look:face:${c.id}`),
      ...TITLES.filter((c) => isUnlocked(c, unlocked)).map((c) => `title:${c.id}`),
    ],
  }
}

/** Lo disponible que todavía no viste, por lugar */
export function newsOf(state: GameState): Record<NewsPlace, string[]> {
  const seen = new Set(state.records.seen)
  const all = availableKeys(state)
  return Object.fromEntries(
    Object.entries(all).map(([place, keys]) => [place, keys.filter((k) => !seen.has(k))]),
  ) as Record<NewsPlace, string[]>
}

/** Todo lo disponible, junto (para partidas nuevas o de antes de esta versión: arrancan sin nada "nuevo") */
export const allAvailable = (state: GameState) => Object.values(availableKeys(state)).flat()

/** Límite de claves guardadas (sobra: hay unas 100 cosas desbloqueables) */
export const SEEN_LIMIT = 400
