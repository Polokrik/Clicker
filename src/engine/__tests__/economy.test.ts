import { describe, expect, it } from 'vitest'
import { Rating } from 'ts-fsrs'
import {
  comboMult,
  offlineCapMs,
  offlineEarnings,
  passiveRate,
  strikeGain,
  UPGRADE_COSTS,
} from '../economy'
import { applyReview, newItemState } from '../scheduler'
import type { ItemState, Tier } from '../types'

describe('strikeGain (§6.1)', () => {
  it('formule de base : 4 × tierMult, sans bonus', () => {
    expect(strikeGain({ tier: 0, bellows: 0, combo: 0, grade: Rating.Good })).toBe(4)
    expect(strikeGain({ tier: 2, bellows: 0, combo: 0, grade: Rating.Good })).toBe(16)
    expect(strikeGain({ tier: 4, bellows: 0, combo: 0, grade: Rating.Good })).toBe(48)
  })

  it('bonus soufflet : +25 %/niveau', () => {
    expect(strikeGain({ tier: 0, bellows: 2, combo: 0, grade: Rating.Good })).toBe(6)
  })

  it('combo : ×(1 + min(combo,20) × 0.1), plafonné à 20', () => {
    expect(strikeGain({ tier: 0, bellows: 0, combo: 5, grade: Rating.Good })).toBe(6)
    expect(strikeGain({ tier: 0, bellows: 0, combo: 20, grade: Rating.Good })).toBe(12)
    expect(strikeGain({ tier: 0, bellows: 0, combo: 50, grade: Rating.Good })).toBe(12)
  })

  it('bonus Easy ×1.5', () => {
    expect(strikeGain({ tier: 0, bellows: 0, combo: 0, grade: Rating.Easy })).toBe(6)
  })

  it('échec → 0 étincelle', () => {
    expect(strikeGain({ tier: 4, bellows: 3, combo: 20, grade: Rating.Again })).toBe(0)
  })

  it('Hard rapporte comme Good (pas de malus, §6.1)', () => {
    expect(strikeGain({ tier: 1, bellows: 0, combo: 0, grade: Rating.Hard })).toBe(
      strikeGain({ tier: 1, bellows: 0, combo: 0, grade: Rating.Good }),
    )
  })
})

describe('comboMult', () => {
  it('1 + min(combo,20) × 0.1', () => {
    expect(comboMult(0)).toBe(1)
    expect(comboMult(10)).toBe(2)
    expect(comboMult(25)).toBe(3)
  })
})

function tieredItem(tier: Tier, now: Date): ItemState {
  // Item avec une review récente → retrievability proche de 1.
  const item = applyReview(newItemState(now), Rating.Good, now)
  return { ...item, tier }
}

describe('passiveRate (§6.2)', () => {
  const now = new Date('2026-07-11T12:00:00Z')

  it('seuls les items tier ≥ 3 produisent', () => {
    const items = {
      t0: tieredItem(0, now),
      t2: tieredItem(2, now),
    }
    expect(passiveRate(items, 0, now)).toBe(0)
  })

  it('un item tier 3 tout chaud produit ~0.7/s (R≈1 × 7 × 0.1)', () => {
    const items = { t3: tieredItem(3, now) }
    const rate = passiveRate(items, 0, now)
    expect(rate).toBeGreaterThan(0.6)
    expect(rate).toBeLessThanOrEqual(0.701)
  })

  it("l'enclume amplifie de +25 %/niveau", () => {
    const items = { t3: tieredItem(3, now) }
    const base = passiveRate(items, 0, now)
    expect(passiveRate(items, 2, now)).toBeCloseTo(base * 1.5, 6)
  })

  it('le refroidissement réduit le revenu (retrievability décroît)', () => {
    const items = { t3: tieredItem(3, now) }
    const later = new Date(now.getTime() + 30 * 86_400_000)
    expect(passiveRate(items, 0, later)).toBeLessThan(passiveRate(items, 0, now))
  })
})

describe('offline (§2, §6.2)', () => {
  const now = new Date('2026-07-11T12:00:00Z')

  it('plafond de base 8 h, +4 h par niveau de cheminée', () => {
    expect(offlineCapMs(0)).toBe(8 * 3_600_000)
    expect(offlineCapMs(3)).toBe(20 * 3_600_000)
  })

  it('les gains hors-ligne sont plafonnés', () => {
    const items = { t3: tieredItem(3, now) }
    const upgrades = { anvil: 0, chimney: 0 }
    const cap = offlineEarnings(
      items,
      upgrades,
      now.getTime() - 48 * 3_600_000,
      now,
    )
    const eightH = offlineEarnings(
      items,
      upgrades,
      now.getTime() - 8 * 3_600_000,
      now,
    )
    expect(cap).toBe(eightH)
  })

  it('lastSeen dans le futur → 0 (pas de gain négatif)', () => {
    const items = { t3: tieredItem(3, now) }
    expect(
      offlineEarnings(items, { anvil: 0, chimney: 0 }, now.getTime() + 10_000, now),
    ).toBe(0)
  })
})

describe('coûts d’upgrades (§6.4)', () => {
  it('progression géométrique conforme', () => {
    expect(UPGRADE_COSTS.bellows(0)).toBe(50)
    expect(UPGRADE_COSTS.bellows(1)).toBe(110)
    expect(UPGRADE_COSTS.anvil(0)).toBe(120)
    expect(UPGRADE_COSTS.anvil(1)).toBe(300)
    expect(UPGRADE_COSTS.chimney(0)).toBe(400)
    expect(UPGRADE_COSTS.chimney(2)).toBe(3600)
  })
})
