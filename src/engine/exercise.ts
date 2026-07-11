import type { ExerciseType, Tier } from './types'
import { TIER_EXERCISE } from './types'

/** Probabilité de servir un exercice d'un tier inférieur pour varier (§4). */
export const LOWER_TIER_CHANCE = 0.2

/**
 * Choisit le type d'exercice pour un item : celui de son tier, avec 20 % de
 * chances d'un tier inférieur aléatoire — jamais supérieur.
 */
export function pickExercise(tier: Tier, rng: () => number = Math.random): ExerciseType {
  if (tier > 0 && rng() < LOWER_TIER_CHANCE) {
    const lower = Math.floor(rng() * tier) as Tier
    return TIER_EXERCISE[lower]
  }
  return TIER_EXERCISE[tier]
}

/**
 * Tire `count` distracteurs dans `pool` (exclut la bonne réponse et les
 * doublons), puis mélange les choix. Utilisé par le QCM et le cloze.
 */
export function buildChoices(
  correct: string,
  pool: string[],
  count: number = 3,
  rng: () => number = Math.random,
): string[] {
  const candidates = [...new Set(pool.filter((w) => w !== correct))]
  // Fisher-Yates partiel sur les candidats
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const choices = [correct, ...candidates.slice(0, count)]
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return choices
}

/** Mélange les tuiles d'une phrase (tuiles + distracteurs), ordre aléatoire. */
export function shuffleTiles(
  tiles: string[],
  distractors: string[],
  rng: () => number = Math.random,
): string[] {
  const all = [...tiles, ...distractors]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}
