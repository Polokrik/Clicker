import { Rating } from 'ts-fsrs'
import type { AnswerOutcome, ExerciseType } from './types'

/**
 * Seuils de temps (ms) au-delà desquels une réussite est notée Hard (§3.2).
 * À régler en playtest.
 */
export const SLOW_THRESHOLD_MS: Record<ExerciseType, number> = {
  qcm: 6_000,
  cloze: 10_000,
  type: 15_000,
  tiles: 20_000,
  audio: 12_000,
}

/** En-deçà de la moitié du seuil = réponse « rapide » (candidate Easy). */
export const FAST_RATIO = 0.5

/**
 * Mapping réponse → grade FSRS (§3.2). Le jeu ne montre jamais les 4 grades.
 * - Échec → Again
 * - Réussite avec tolérance typo (fuzzy) → Hard
 * - Réussite lente (> seuil) → Hard
 * - Réussite rapide ET streak ≥ 3 → Easy
 * - Sinon → Good
 */
export function gradeAnswer(outcome: AnswerOutcome): Rating {
  if (!outcome.correct) return Rating.Again
  if (outcome.fuzzy) return Rating.Hard
  const threshold = SLOW_THRESHOLD_MS[outcome.exercise]
  if (outcome.elapsedMs > threshold) return Rating.Hard
  if (outcome.elapsedMs <= threshold * FAST_RATIO && outcome.streak >= 3) {
    return Rating.Easy
  }
  return Rating.Good
}
