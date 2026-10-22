import { describe, expect, it } from 'vitest'
import { cardEffects } from './cards'

describe('efectos combinados de las cartas', () => {
  it('sin cartas, nada cambia', () => {
    const fx = cardEffects([])
    expect(fx.clickMult).toBe(1)
    expect(fx.critExtra).toBe(0)
  })

  it('los multiplicadores se multiplican y los extras se suman', () => {
    const fx = cardEffects([
      { id: 'pianist', rare: false }, // clics ×1,5
      { id: 'allRounder', rare: false }, // clics ×1,15
      { id: 'masterStroke', rare: false }, // críticos +1
      { id: 'chainCrit', rare: true }, // +20 % crítico
    ])
    expect(fx.clickMult).toBeCloseTo(1.725)
    expect(fx.critExtra).toBe(1)
    expect(fx.critChance).toBeCloseTo(0.2)
  })

  it('las raras son más fuertes', () => {
    expect(cardEffects([{ id: 'scrum', rare: true }]).autoMult).toBeGreaterThan(
      cardEffects([{ id: 'scrum', rare: false }]).autoMult,
    )
  })

  it('una carta desconocida no rompe nada', () => {
    expect(cardEffects([{ id: 'no-existe', rare: false }]).clickMult).toBe(1)
  })
})
