import { describe, expect, it } from 'vitest'
import { Rating } from 'ts-fsrs'
import { gradeAnswer, SLOW_THRESHOLD_MS } from '../grading'

describe('gradeAnswer — mapping réponse → grade FSRS (§3.2)', () => {
  it('échec → Again, quel que soit le temps', () => {
    expect(
      gradeAnswer({ correct: false, elapsedMs: 1000, exercise: 'qcm', streak: 10 }),
    ).toBe(Rating.Again)
  })

  it('réussite lente (> seuil) → Hard', () => {
    expect(
      gradeAnswer({ correct: true, elapsedMs: 6_001, exercise: 'qcm', streak: 0 }),
    ).toBe(Rating.Hard)
    expect(
      gradeAnswer({ correct: true, elapsedMs: 15_001, exercise: 'type', streak: 0 }),
    ).toBe(Rating.Hard)
  })

  it('réussite normale → Good', () => {
    expect(
      gradeAnswer({ correct: true, elapsedMs: 5_000, exercise: 'qcm', streak: 0 }),
    ).toBe(Rating.Good)
  })

  it('réussite rapide MAIS streak < 3 → Good (pas Easy)', () => {
    expect(
      gradeAnswer({ correct: true, elapsedMs: 1_000, exercise: 'qcm', streak: 2 }),
    ).toBe(Rating.Good)
  })

  it('réussite rapide ET streak ≥ 3 → Easy', () => {
    expect(
      gradeAnswer({ correct: true, elapsedMs: 2_500, exercise: 'qcm', streak: 3 }),
    ).toBe(Rating.Easy)
  })

  it('réussite typo-tolérée (fuzzy) → Hard même si rapide', () => {
    expect(
      gradeAnswer({
        correct: true,
        fuzzy: true,
        elapsedMs: 2_000,
        exercise: 'type',
        streak: 5,
      }),
    ).toBe(Rating.Hard)
  })

  it('chaque type d’exercice a son propre seuil', () => {
    for (const [exercise, threshold] of Object.entries(SLOW_THRESHOLD_MS)) {
      expect(
        gradeAnswer({
          correct: true,
          elapsedMs: threshold + 1,
          exercise: exercise as keyof typeof SLOW_THRESHOLD_MS,
          streak: 0,
        }),
      ).toBe(Rating.Hard)
    }
  })
})
