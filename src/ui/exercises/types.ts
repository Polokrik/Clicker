import type { Item } from '../../content/schema'

export interface ExerciseResult {
  correct: boolean
  /** Réussite avec tolérance typo (saisie clavier / audio). */
  fuzzy?: boolean
}

export interface ExerciseProps {
  item: Item & { vein: string }
  onAnswer: (result: ExerciseResult) => void
}
