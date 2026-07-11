import type { Card } from 'ts-fsrs'

/** Tiers de maîtrise — paliers cognitifs (§4 de la spec). */
export type Tier = 0 | 1 | 2 | 3 | 4

/** Types d'exercice, un par tier (plus variation occasionnelle vers le bas). */
export type ExerciseType = 'qcm' | 'cloze' | 'type' | 'tiles' | 'audio'

export const TIER_EXERCISE: Record<Tier, ExerciseType> = {
  0: 'qcm',
  1: 'cloze',
  2: 'type',
  3: 'tiles',
  4: 'audio',
}

/** Multiplicateurs d'étincelles par tier (§4). */
export const TIER_MULT: Record<Tier, number> = { 0: 1, 1: 2, 2: 4, 3: 7, 4: 12 }

/** Seuils de stability (jours) pour monter de tier (§4). */
export const TIER_STABILITY_THRESHOLDS: Record<Exclude<Tier, 0>, number> = {
  1: 1,
  2: 3,
  3: 10,
  4: 30,
}

/** Noms des tiers (clé i18n côté UI). */
export const TIER_NAMES: Record<Tier, string> = {
  0: 'Minerai brut',
  1: 'Chauffé',
  2: 'Forgé',
  3: 'Trempé',
  4: 'Maîtrisé',
}

export interface ItemState {
  /** État ts-fsrs sérialisé (dates en ISO string après round-trip JSON). */
  fsrs: Card
  tier: Tier
  streak: number
  totalReps: number
  lapses: number
}

export interface AlloyState {
  id: string
  vein: string
  itemIds: string[]
  createdAt: number
}

export interface PlayerState {
  sparks: number
  upgrades: { bellows: number; anvil: number; chimney: number }
  unlockedVeins: string[]
  completedVeins: string[]
  items: Record<string, ItemState>
  alloys: AlloyState[]
  settings: { newPerDay: number; ttsVoice?: string; reducedMotion?: boolean }
  lastSeen: number // epoch ms, pour le calcul offline
  /** Historique du jour pour la limite new_per_day. */
  newIntroducedToday: { date: string; count: number }
  stats: { reviewsTotal: number; reviewsCorrect: number; sessionStart: number }
}

/** Issue d'une réponse du joueur, avant mapping FSRS. */
export interface AnswerOutcome {
  correct: boolean
  /** Réussite avec tolérance typo (Levenshtein ≤ 1) → forcé Hard. */
  fuzzy?: boolean
  elapsedMs: number
  exercise: ExerciseType
  /** Streak actuel de l'item AVANT cette réponse. */
  streak: number
}
