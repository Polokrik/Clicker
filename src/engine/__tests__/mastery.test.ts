import { describe, expect, it } from 'vitest'
import { Rating } from 'ts-fsrs'
import { applyReview, newItemState } from '../scheduler'
import { estimateLevel, itemStatus, veinMastery, weakVeins } from '../mastery'

const day = 86_400_000

describe('itemStatus', () => {
  it('un item raté est tout de suite « à re-forger », même si sa chaleur affiche 100 %', () => {
    const t0 = new Date('2026-01-01T10:00:00Z')
    const failed = applyReview(newItemState(t0), Rating.Again, t0)
    expect(itemStatus(failed, t0)).toBe('due')
    expect(itemStatus(failed, new Date(t0.getTime() + 30 * 60_000))).toBe('due')
  })

  it('une première réussite reste fragile (pas encore forgé)', () => {
    const t0 = new Date('2026-01-01T10:00:00Z')
    const ok = applyReview(newItemState(t0), Rating.Good, t0)
    expect(itemStatus(ok, t0)).toBe('shaky')
  })

  it('devient solide après plusieurs réussites espacées', () => {
    let s = newItemState(new Date('2026-01-01T00:00:00Z'))
    let now = new Date('2026-01-01T00:00:00Z')
    for (let i = 0; i < 6; i++) {
      s = applyReview(s, Rating.Good, now)
      now = new Date(new Date(s.fsrs.due).getTime() + 1000)
    }
    const justAfter = new Date(now.getTime() + 1000)
    s = applyReview(s, Rating.Good, justAfter)
    expect(s.tier).toBeGreaterThanOrEqual(2)
    expect(itemStatus(s, new Date(justAfter.getTime() + day / 24))).toBe('solid')
  })
})

describe('item jamais frappé', () => {
  it('est « nouveau », pas fragile', () => {
    expect(itemStatus(newItemState())).toBe('new')
  })
})

describe('veinMastery', () => {
  it('compte les items jamais vus à 0 % et mesure la part solide', () => {
    const m = veinMastery(['a', 'b', 'c', 'd'], {})
    expect(m).toMatchObject({ total: 4, unseen: 4, pct: 0 })
  })
})

describe('test de niveau', () => {
  const cefr = { v1: 'A2', v2: 'A2', v3: 'B1' } as const
  it('estime le dernier niveau dont la moyenne ≥ 60 %', () => {
    const r = { v1: { correct: 2, total: 2 }, v2: { correct: 1, total: 2 }, v3: { correct: 0, total: 2 } }
    expect(estimateLevel(r, cefr)).toBe('A2')
  })
  it('null si le niveau le plus bas échoue', () => {
    const r = { v1: { correct: 0, total: 2 }, v2: { correct: 0, total: 2 }, v3: { correct: 2, total: 2 } }
    expect(estimateLevel(r, cefr)).toBeNull()
  })
  it('liste les règles faibles, la pire d’abord', () => {
    const r = { v1: { correct: 1, total: 2 }, v2: { correct: 0, total: 2 }, v3: { correct: 2, total: 2 } }
    expect(weakVeins(r)).toEqual(['v2'])
  })
})
