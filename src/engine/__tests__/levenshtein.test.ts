import { describe, expect, it } from 'vitest'
import { levenshtein, matchTyped, normalizeAnswer } from '../levenshtein'

describe('levenshtein', () => {
  it('cas de base', () => {
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('abc', '')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('order', 'order')).toBe(0)
    expect(levenshtein('order', 'ordre')).toBe(2)
    expect(levenshtein('order', 'ordr')).toBe(1)
  })
})

describe('normalizeAnswer', () => {
  it('casse, espaces multiples, apostrophes typographiques', () => {
    expect(normalizeAnswer('  I’d  Like ')).toBe("i'd like")
  })
})

describe('matchTyped — tolérance typo (§4, tier 2)', () => {
  it('exact après normalisation', () => {
    expect(matchTyped('To Order', 'to order')).toBe('exact')
  })

  it('une typo (distance 1) → fuzzy (noté Hard)', () => {
    expect(matchTyped('to ordr', 'to order')).toBe('fuzzy')
    expect(matchTyped('to orderr', 'to order')).toBe('fuzzy')
    expect(matchTyped('to oreder', 'to order')).toBe('fuzzy')
  })

  it('deux typos ou plus → wrong', () => {
    expect(matchTyped('to ordre', 'to order')).toBe('wrong')
    expect(matchTyped('command', 'to order')).toBe('wrong')
  })
})
