import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'
import type { ItemState, Tier } from './types'
import { TIER_STABILITY_THRESHOLDS } from './types'

/**
 * Instance FSRS partagée. request_retention 0.9 par défaut (§10 : ajuster si
 * le taux de réussite sur les Review dus sort de la cible > 85 %).
 */
export const scheduler = fsrs(
  generatorParameters({ enable_fuzz: true, request_retention: 0.9 }),
)

/** Crée l'état d'un item jamais vu. */
export function newItemState(now: Date = new Date()): ItemState {
  return {
    fsrs: createEmptyCard(now),
    tier: 0,
    streak: 0,
    totalReps: 0,
    lapses: 0,
  }
}

/**
 * Les dates d'une Card deviennent des string après un round-trip JSON
 * (persistance IndexedDB / export). Toujours revivifier avant usage.
 */
export function reviveCard(card: Card): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }
}

/** Retrievability ∈ [0,1] à l'instant `now`. Items New : 0 (jamais chauffés). */
export function retrievability(card: Card, now: Date = new Date()): number {
  const revived = reviveCard(card)
  if (revived.state === State.New) return 0
  return scheduler.get_retrievability(revived, now, false)
}

/**
 * Chaleur affichée = retrievability × 100, plancher visuel 5 % pour les items
 * déjà forgés (§3.3). Les items New restent à 0 (minerai froid).
 */
export function heat(card: Card, now: Date = new Date()): number {
  const revived = reviveCard(card)
  if (revived.state === State.New) return 0
  return Math.max(5, retrievability(revived, now) * 100)
}

/** Tier atteint pour une stability donnée (le tier ne redescend jamais, §4). */
export function tierForStability(stability: number, current: Tier): Tier {
  let next: Tier = current
  for (const t of [1, 2, 3, 4] as const) {
    if (stability >= TIER_STABILITY_THRESHOLDS[t] && t > next) next = t
  }
  return next
}

/**
 * Applique une review FSRS et met à jour tier/streak/compteurs.
 * Retourne le nouvel ItemState (immutable) et le grade appliqué.
 */
export function applyReview(
  item: ItemState,
  grade: Grade,
  now: Date = new Date(),
): ItemState {
  const card = reviveCard(item.fsrs)
  const { card: nextCard } = scheduler.next(card, now, grade)
  const failed = grade === Rating.Again
  return {
    fsrs: nextCard,
    tier: failed ? item.tier : tierForStability(nextCard.stability, item.tier),
    streak: failed ? 0 : item.streak + 1,
    totalReps: item.totalReps + 1,
    lapses: failed ? item.lapses + 1 : item.lapses,
  }
}

/** Un item est-il dû (Learning/Relearning step écoulé ou Review en retard) ? */
export function isDue(item: ItemState, now: Date = new Date()): boolean {
  const card = reviveCard(item.fsrs)
  if (card.state === State.New) return false
  return card.due.getTime() <= now.getTime()
}
