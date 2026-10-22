// Efectos combinados de las cartas elegidas (F1). Todos los cálculos que tocan una carta pasan por acá.
import { NO_EFFECTS, getCard, type CardEffects, type CardPick } from '../data/cards'

/** Suma los efectos de todas las cartas: los multiplicadores se multiplican, lo demás se suma */
export function cardEffects(cards: CardPick[]): CardEffects {
  const total: CardEffects = { ...NO_EFFECTS }
  for (const pick of cards) {
    const effects = getCard(pick.id)?.effects(pick.rare) ?? {}
    for (const [key, value] of Object.entries(effects) as [keyof CardEffects, number | boolean][]) {
      if (typeof value === 'boolean') total.crunchNoTired ||= value
      else if (key.endsWith('Mult')) (total[key] as number) *= value
      else (total[key] as number) += value
    }
  }
  return total
}
