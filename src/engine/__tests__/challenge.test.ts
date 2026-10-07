import { describe, expect, it } from 'vitest'
import {
  challengeFromHash,
  decodeChallenge,
  encodeChallenge,
  pickChallengeItems,
  questionPoints,
  type Challenge,
} from '../challenge'

const base: Challenge = { v: 1, pack: 'en-fr', scope: 'mix', seed: 123456, n: 10, name: 'Zoé é', score: 1240, correct: 8 }

describe('défi asynchrone', () => {
  it('aller-retour lien : encode puis decode (accents compris)', () => {
    expect(decodeChallenge(encodeChallenge(base))).toEqual(base)
    expect(challengeFromHash(`#c=${encodeChallenge(base)}`)).toEqual(base)
  })

  it('rejette un lien trafiqué ou invalide sans lever d’exception', () => {
    expect(decodeChallenge('%%%')).toBeNull()
    expect(decodeChallenge(encodeChallenge({ ...base, score: 999999 }))).toBeNull()
    expect(decodeChallenge(encodeChallenge({ ...base, n: 1 }))).toBeNull()
    expect(challengeFromHash('#autre')).toBeNull()
  })

  it('les deux joueurs tirent les mêmes questions, dans le même ordre', () => {
    const ids = Array.from({ length: 40 }, (_, i) => `item_${i}`)
    const a = pickChallengeItems(ids, 42, 10)
    const b = pickChallengeItems([...ids].reverse(), 42, 10)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(10)
    expect(pickChallengeItems(ids, 43, 10)).not.toEqual(a)
  })

  it('limite à ce qui existe', () => {
    expect(pickChallengeItems(['a', 'b', 'c'], 1, 10)).toHaveLength(3)
  })

  it('points : 0 si faux, 100–150 si juste, plus vite = plus de points', () => {
    expect(questionPoints(false, 500)).toBe(0)
    expect(questionPoints(true, 0)).toBe(150)
    expect(questionPoints(true, 4000)).toBe(125)
    expect(questionPoints(true, 20_000)).toBe(100)
  })
})
