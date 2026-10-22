// Efectos combinados de las cartas (F1) y los artefactos (F3). Todos los bonus de esos sistemas pasan por acá.
import { getArtifact } from '../data/artifacts'
import { NO_EFFECTS, getCard, type CardEffects, type CardPick } from '../data/cards'
import { getChallenge } from '../data/challenges'
import type { GameState } from './reducer'

/** Suma una lista de efectos: los multiplicadores ("…Mult") se multiplican, lo demás se suma */
export function combineEffects(list: Partial<CardEffects>[]): CardEffects {
  const total: CardEffects = { ...NO_EFFECTS }
  for (const effects of list) {
    for (const [key, value] of Object.entries(effects) as [keyof CardEffects, number | boolean][]) {
      if (typeof value === 'boolean') total.crunchNoTired ||= value
      else if (key.endsWith('Mult')) (total[key] as number) *= value
      else (total[key] as number) += value
    }
  }
  return total
}

/** Efectos de las cartas elegidas */
export function cardEffects(cards: CardPick[]): CardEffects {
  return combineEffects(cards.map((pick) => getCard(pick.id)?.effects(pick.rare) ?? {}))
}

/** Todos los bonus de cartas, artefactos y el desafío juntos: es lo que usan las fórmulas del juego */
export function bonuses(state: Pick<GameState, 'cards' | 'records'> & { challenge?: string | null }): CardEffects {
  const artifacts = Object.entries(state.records.artifacts).map(([id, level]) => getArtifact(id)?.effects(level) ?? {})
  const challenge = getChallenge(state.challenge ?? null)?.effects ?? {}
  return combineEffects([
    ...state.cards.map((pick) => getCard(pick.id)?.effects(pick.rare) ?? {}),
    ...artifacts,
    challenge,
  ])
}
