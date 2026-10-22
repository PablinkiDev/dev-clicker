import { describe, expect, it } from 'vitest'
import { offerContextOf } from './offerContext'
import { createInitialState } from './reducer'

describe('offerContextOf', () => {
  it('dimensiona los contratos sin el desafío (si no, el desafío se anula solo)', () => {
    const base = { ...createInitialState(), stage: 3 }
    const normal = offerContextOf(base, 5)
    const tied = offerContextOf({ ...base, challenge: 'tiedHands' }, 5)
    expect(tied.sizingPerSecond).toBeCloseTo(normal.perSecond)
    expect(tied.perSecond).toBeLessThan(normal.perSecond)
  })

  it('Contrarreloj acorta el plazo después de dimensionar', () => {
    const base = createInitialState()
    const clock = offerContextOf({ ...base, challenge: 'againstTheClock' }, 5)
    expect(clock.timeBonus).toBeCloseTo(offerContextOf(base, 5).timeBonus ?? 1)
    expect(clock.challengeTime).toBe(0.5)
  })
})
