import { describe, expect, it } from 'vitest'
import { offerContextOf } from './offerContext'
import { createInitialState } from './reducer'
import { createCandidate } from './team'

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
    expect(clock.extraTime).toBe(0.5)
  })

  it('el PM da más plazo sin agrandar el código', () => {
    const base = createInitialState()
    const withPm = offerContextOf({ ...base, team: [createCandidate('pm', [], 2, 5)] }, 5)
    expect(withPm.extraTime).toBeCloseTo(1.2)
    expect(withPm.sizingPerSecond).toBeCloseTo(offerContextOf(base, 5).sizingPerSecond ?? 0)
  })
})
